import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = 'http://localhost:3000';

const post429 = new Counter('post_429');
const get429 = new Counter('get_429');
const delete429 = new Counter('delete_429');

const usuarios = [
  { email: 'teste1@email.com', password: 'teste1' },
  { email: 'teste2@email.com', password: 'teste2' },
  { email: 'teste3@email.com', password: 'teste3' },
];

export let options = {
  stages: [
    { duration: '2m', target: 120 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 0 },
  ],
};

function gerarDatas() {
  const hoje = new Date();

  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() + Math.floor(Math.random() * 30) + 1);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 3);

  return {
    checkin: inicio.toISOString().split('T')[0],
    checkout: fim.toISOString().split('T')[0],
  };
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' };

  const tokens = usuarios
    .map((usuario) => {
      const loginRes = http.post(
        `${BASE_URL}/users/login`,
        JSON.stringify(usuario),
        { headers }
      );

      check(loginRes, {
        'Login status 200': (r) => r.status === 200,
      });

      let body = {};

      try {
        body = JSON.parse(loginRes.body);
      } catch (e) {
        console.log(`Erro ao fazer parse do login de ${usuario.email}`);
      }

      return {
        token: loginRes.cookies.token?.[0]?.value,
        userId: body._id,
        email: usuario.email,
      };
    })
    .filter((usuario) => usuario.token && usuario.userId);

  const placesRes = http.get(`${BASE_URL}/places`);

  check(placesRes, {
    'GET Places status 200': (r) => r.status === 200,
  });

  let placesBody = [];

  try {
    placesBody = JSON.parse(placesRes.body);
  } catch (e) {
    console.log('Erro ao fazer parse dos places');
  }

  const placeIds = placesBody.map((place) => place._id).filter(Boolean);

  console.log('USUÁRIOS LOGADOS:', tokens.length);
  console.log('PLACES ENCONTRADOS:', placeIds.length);

  return { tokens, placeIds };
}

export default function (data) {
  if (!data.tokens.length || !data.placeIds.length) {
    return;
  }

  const usuario = data.tokens[Math.floor(Math.random() * data.tokens.length)];
  const placeId = data.placeIds[Math.floor(Math.random() * data.placeIds.length)];
  const datas = gerarDatas();

  const headers = { 'Content-Type': 'application/json' };

  const payload = JSON.stringify({
    place: placeId,
    price: 150,
    total: 450,
    checkin: datas.checkin,
    checkout: datas.checkout,
    guests: 2,
    nights: 3,
  });

  const postRes = http.post(`${BASE_URL}/bookings/`, payload, {
    headers,
    cookies: { token: usuario.token },
  });

  if (postRes.status === 429) post429.add(1);

  check(postRes, {
    'POST Reserva status 200/201/400/429': (r) =>
      r.status === 200 ||
      r.status === 201 ||
      r.status === 400 ||
      r.status === 429,
  });

  const getRes = http.get(`${BASE_URL}/bookings/owner`, {
    headers,
    cookies: { token: usuario.token },
  });

  if (getRes.status === 429) get429.add(1);

  check(getRes, {
    'GET Owner status 200/429': (r) =>
      r.status === 200 || r.status === 429,
  });

  let deleteRes;

  try {
    const body = JSON.parse(postRes.body);
    const bookingId = body._id;

    if (bookingId) {
      deleteRes = http.del(`${BASE_URL}/bookings/${bookingId}`, null, {
        headers,
        cookies: { token: usuario.token },
      });

      if (deleteRes.status === 429) delete429.add(1);

      check(deleteRes, {
        'DELETE Reserva status 200/429': (r) =>
          r.status === 200 || r.status === 429,
      });
    }
  } catch (e) {
    // Ignora erro de parse quando o POST retornar 400/429 ou body vazio
  }

  sleep(1);
}