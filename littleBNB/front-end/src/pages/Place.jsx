import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import Perk from "../components/Perk";
import Booking from "../components/Booking";

const Place = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const [place, setPlace] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [booking, setBooking] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const numberOfDays = (date1, date2) => {
    const date1GMT = date1 + "GMT-03:00";
    const date2GMT = date2 + "GMT-03:00";

    const dateCheckin = new Date(date1GMT);
    const dateCheckout = new Date(date2GMT);

    return (
      (dateCheckout.getTime() - dateCheckin.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  useEffect(() => {
    // Só faz essa busca se existir place E usuário logado
    if (place && user) {
      const axiosGet = async () => {
        try {
          const { data } = await axios.get("/bookings/owner");

          setBooking(
            data.filter((booking) => {
              // Proteção se o place da reserva foi deletado
              if (!booking.place) return false;

              return booking.place._id === place._id;
            })[0]
          );
        } catch (error) {
          console.error(
            "Erro ao verificar as reservas do usuário logado:",
            error
          );
        }
      };

      axiosGet();
    }
  }, [place, user]);

  useEffect(() => {
    if (id) {
      const axiosGet = async () => {
        const { data } = await axios.get(`/places/${id}`);
        setPlace(data);
      };

      axiosGet();
    }
  }, [id]);

  useEffect(() => {
    overlay
      ? document.body.classList.add("overflow-hidden")
      : document.body.classList.remove("overflow-hidden");
  }, [overlay]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (checkin && checkout && guests) {
      if (parseInt(guests) > place.guests) {
        setErrorMsg(
          `A quantidade de convidados que você colocou não é permitida. O máximo é ${place.guests}.`
        );
        return;
      }

      const nights = numberOfDays(checkin, checkout);

      const objBooking = {
        place: id,
        user: user._id,
        price: place.price,
        total: place.price * nights,
        checkin,
        checkout,
        guests,
        nights,
      };

    try {
  const { data } = await axios.post("/bookings", objBooking);
  setRedirect(true);
} catch (error) {
  if (error.response?.status === 429) {
    setErrorMsg(error.response.data.error);
  } else if (error.response?.status === 400) {
    setErrorMsg(
      "Infelizmente essa reserva no momento está indisponível para essa data. Escolha outra data por favor."
    );
  } else {
    setErrorMsg("Ocorreu um erro ao tentar realizar a reserva.");
  }
}
    }
  };

  if (redirect) return <Navigate to="/account/bookings" />;
  if (!place) return <></>;

  return (
    <section>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-6 sm:p-8">
        <div className="flex flex-col sm:gap-1">
          <div className="text-xl font-bold sm:text-3xl">
            {place.title}
          </div>

          <div className="flex items-center gap-1">
            <p>{place.city}</p>
          </div>
        </div>

        {booking ? <Booking booking={booking} place={true} /> : ""}

        <div className="relative grid aspect-square gap-4 overflow-hidden rounded-2xl sm:aspect-[3/2] sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
          {place.photos
            .filter((photo, index) => index < 3)
            .map((photo, index) => (
              <img
                className={`${
                  index === 0
                    ? "row-span-2 h-full object-center"
                    : ""
                } aspect-square w-full cursor-pointer transition hover:opacity-75 sm:object-cover`}
                src={`${import.meta.env.VITE_AXIOS_BASE_URL}/tmp/${photo}`}
                alt="Imagem da Acomodação"
                onClick={() => setOverlay(true)}
                key={photo}
              />
            ))}
        </div>

        <div className={`grid ${booking ? "" : "grid-cols-1 md:grid-cols-2"}`}>
          <div className="order-2 flex flex-col gap-5 p-6 md:order-none">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold sm:text-2xl">Descrição</p>
              <p>{place.description}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold sm:text-2xl">
                Horários e Restrições
              </p>

              <div>
                <p>Checkin: {place.checkin}</p>
                <p>Checkout: {place.checkout}</p>
                <p>Máximo de convidados: {place.guests}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold sm:text-2xl">
                Diferenciais
              </p>

              <div className="flex flex-col gap-1">
                {place.perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <Perk perk={perk}></Perk>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {booking ? (
            ""
          ) : (
            <form className="order-1 flex flex-col gap-4 self-center justify-self-center rounded-2xl border border-gray-300 px-4 py-3 sm:px-8 sm:py-4 md:order-none">
              <p className="text-center text-lg font-bold sm:text-2xl">
                Preço: R$ {place.price} por noite
              </p>

              <div className="flex flex-col sm:flex-row">
                <div className="rounded-tl-2xl rounded-tr-2xl border border-gray-300 px-4 py-2 sm:rounded-tr-none sm:rounded-bl-2xl">
                  <p className="font-bold">Checkin</p>
                  <input
                    className="w-full sm:w-auto"
                    type="date"
                    min={today}
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                  />
                </div>

                <div className="rounded-br-2xl rounded-bl-2xl border border-t-0 border-gray-300 px-4 py-2 sm:rounded-tr-2xl sm:rounded-bl-none sm:border-t sm:border-l-0">
                  <p className="font-bold">Checkout</p>
                  <input
                    type="date"
                    className="w-full sm:w-auto"
                    min={checkin || today}
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-300 px-4 py-2">
                <p className="font-bold">N° de convidados</p>
                <input
                  type="number"
                  className="rounded-2xl border border-gray-300 px-4 py-2"
                  placeholder="2"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>

              {user ? (
                <button
                  className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-center font-bold text-white"
                  onClick={handleBooking}
                >
                  Reservar
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-center font-bold text-white"
                >
                  Faça seu login
                </Link>
              )}

              {errorMsg && (
                <div className="text-center text-red-500 font-semibold mt-2">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Place;