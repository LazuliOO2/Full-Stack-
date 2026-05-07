import axios from "axios";
import React, { useEffect, useState } from "react";
import Booking from "./Booking";

const AccBookings = () => {
  const [bookings, setBookings] = useState([]);
  // 1. Criamos um estado para armazenar a mensagem de erro na tela
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const axiosGet = async () => {
      // 2. Envolvemos a requisição GET em um try...catch
      try {
        setErrorMsg(""); // Limpa erros anteriores antes de tentar de novo
        const { data } = await axios.get("/bookings/owner");
        setBookings(data);
      } catch (error) {
        // Se bater no Rate Limit (429), pega a mensagem que vem do back-end
        if (error.response?.status === 429) {
          setErrorMsg(error.response.data.error);
        } else {
          setErrorMsg("Ocorreu um erro ao carregar suas reservas.");
        }
      }
    };

    axiosGet();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Deseja cancelar esta reserva?")) {
      try {
        setErrorMsg(""); // Limpa erros anteriores
        await axios.delete(`/bookings/${id}`);
        setBookings(bookings.filter(b => b._id !== id));
      } catch (error) {
        // 3. Ajustamos o catch do DELETE para tratar o erro 429 e mostrar na tela
        if (error.response?.status === 429) {
          setErrorMsg(error.response.data.error);
        } else {
          setErrorMsg("Ocorreu um erro ao tentar cancelar a reserva.");
        }
        console.error("Erro ao deletar reserva:", error);
      }
    }
  };

  return (
    <div className="flex w-full max-w-7xl flex-col gap-8">
      
      {/* 4. Exibimos a mensagem de erro na tela se ela existir */}
      {errorMsg && (
        <div className="rounded-md bg-red-500 p-4 text-center font-semibold text-white">
          {errorMsg}
        </div>
      )}

      {bookings.map((booking) => (
        <div key={booking._id} className="relative">
          <Booking booking={booking} />
          <button
            onClick={(e) => handleDelete(e, booking._id)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white transition hover:bg-red-600"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
};

export default AccBookings;