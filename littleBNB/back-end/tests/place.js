import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';
const headers = { 'Content-Type': 'application/json' };

export let options = {
    stages: [
        { duration: '2m', target: 120 },
        { duration: '2m', target: 150 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 0 },
    ],
};

export function setup() {
  const dadosLogin = {
    email: 'teste1@email.com',
    password: 'teste1',
  };

  const loginRes = http.post(
    `${BASE_URL}/users/login`,
    JSON.stringify(dadosLogin),
    { headers }
  );

  console.log('Status login:', loginRes.status);
  console.log('Body login:', loginRes.body);
  console.log('Cookies login:', JSON.stringify(loginRes.cookies));

  check(loginRes, {
    'Login status 200': (r) => r.status === 200,
  });

  const token = loginRes.cookies.token
    ? loginRes.cookies.token[0].value
    : null;

  if (!token) {
    console.error('Token não encontrado nos cookies do login.');
  } else {
    console.log('Token capturado com sucesso no setup.');
  }

  return { token };
}

export default function (data) {
  if (!data || !data.token) {
    console.error('Teste abortado: token ausente no setup.');
    sleep(1);
    return;
  }

  const payload = JSON.stringify({
    title: 'teste',
    city: 'teste',
    photos: ['link-da-imagem1.jpg', 'link-da-imagem2.jpg'],
    description: 'teste',
    extras: 'N/A',
    perks: ['Wi-Fi', 'Piscina', 'Estacionamento'],
    price: 120,
    checkin: '14:00',
    checkout: '14:00',
    guests: 2,
  });

  const postRes = http.post(`${BASE_URL}/places/`, payload, {
    headers,
    cookies: {
      token: data.token,
    },
  });

  console.log('Status POST /places:', postRes.status);
  console.log('Body POST /places:', postRes.body);

  check(postRes, {
    'POST Place status 200/201': (r) => r.status === 200 || r.status === 201,
  });

  let placeId = null;

  try {
    const placeBody = JSON.parse(postRes.body);
    placeId = placeBody._id;
    console.log('Place ID criado:', placeId);
  } catch (e) {
    console.error('Erro ao converter resposta do POST em JSON:', e);
  }

  const getOwnerRes = http.get(`${BASE_URL}/places/owner`, {
    cookies: {
      token: data.token,
    },
  });

  console.log('Status GET /places/owner:', getOwnerRes.status);
  console.log('Body GET /places/owner:', getOwnerRes.body);

  check(getOwnerRes, {
    'GET Owner Places status 200': (r) => r.status === 200,
  });

  if (placeId) {
    const getSingleRes = http.get(`${BASE_URL}/places/${placeId}`);

    console.log('Status GET /places/:id:', getSingleRes.status);
    console.log('Body GET /places/:id:', getSingleRes.body);

    check(getSingleRes, {
      'GET Single Place status 200': (r) => r.status === 200,
    });

    const payloadUpgrade = JSON.stringify({
      title: 'testeUpgrade',
      city: 'testeUpgrade',
      photos: ['link-da-imagem1Upgrade.jpg', 'link-da-imagem2Upgrade.jpg'],
      description: 'testeUpgrade',
      extras: 'N/A',
      perks: ['Wi-Fi', 'Piscina', 'Estacionamento'],
      price: 10,
      checkin: '15:00',
      checkout: '15:00',
      guests: 1,
    });

    const putRes = http.put(`${BASE_URL}/places/${placeId}`, payloadUpgrade, {
      headers,
      cookies: {
        token: data.token,
      },
    });

    console.log('Status PUT /places/:id:', putRes.status);
    console.log('Body PUT /places/:id:', putRes.body);

    check(putRes, {
      'PUT Place status 200': (r) => r.status === 200,
    });

    const delRes = http.del(`${BASE_URL}/places/${placeId}`, null, {
      headers,
      cookies: {
        token: data.token,
      },
    });

    console.log('Status DELETE /places/:id:', delRes.status);
    console.log('Body DELETE /places/:id:', delRes.body);

    check(delRes, {
      'DELETE Place status 200': (r) => r.status === 200,
    });
  } else {
    console.error('placeId não foi obtido. PUT e DELETE não serão executados.');
  }

  sleep(1);
}