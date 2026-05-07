import { Router } from "express";
import Booking from "./model.js";
import { connectDb } from "../../config/db.js";
import { JWTVerify } from "../../utils/jwt.js";

import { bookingReadLimiter,
  bookingCreateLimiter,
  bookingDeleteLimiter,} from "../../middlewares/ratelimit.js"

const router = Router();

router.get("/owner",bookingReadLimiter, async (req, res) => {
  connectDb();

  try {
    const tokenData = await JWTVerify(req);

    if (!tokenData) {
      return res.status(401).json("Usuário não autorizado");
    }

    const bookingDocs = await Booking.find({ user: tokenData._id }).populate("place");

    res.json(bookingDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro ao validar o token do usuário");
  }
});

router.post("/",bookingCreateLimiter, async (req, res) => {
  connectDb();

  try {
    // 1. Pega o usuário do Token (Garante que a reserva vá para quem está logado)
    const tokenData = await JWTVerify(req);
    if (!tokenData) return res.status(401).json({ error: "Usuário não está logado" });

    const userId = tokenData._id;

    const { place, price, total, checkin, checkout, guests, nights } = req.body;

    // 2. Verifica se a hospedagem já está ocupada naquelas datas (Bloqueio)
    const conflictingBooking = await Booking.findOne({
      place: place,
      $and: [
        { checkin: { $lt: checkout } }, 
        { checkout: { $gt: checkin } }
      ]
    });

    if (conflictingBooking) {
      // Se bater no status 400, o seu try...catch do Front-end exibe a mensagem!
      return res.status(400).json({ 
        error: "Esta hospedagem já está reservada para as datas selecionadas." 
      });
    }

    // 3. Cria a reserva
    const newBookingDoc = await Booking.create({
      place,
      user: userId, // Atrelando ao ID seguro que veio do token
      price,
      total,
      checkin,
      checkout,
      guests,
      nights,
    });

    res.json(newBookingDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro ao criar a Reserva");
  }
});

router.delete("/:id",  bookingDeleteLimiter,async (req, res) => {
  connectDb();
  const { id } = req.params; // ID da reserva

  try {
    // 1. Verifica o usuário usando a sua função pronta
    const userData = await JWTVerify(req);

    // 2. Busca a reserva
    const bookingDoc = await Booking.findById(id);
    if (!bookingDoc) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    // 3. Verifica se o dono da reserva é o usuário logado
    if (bookingDoc.user.toString() !== userData._id.toString()) {
      return res.status(403).json({ error: "Você não tem permissão para cancelar esta reserva" });
    }

    // 4. Apaga a reserva
    await Booking.findByIdAndDelete(id);
    res.json({ message: "Reserva cancelada com sucesso" });

  } catch (err) {
    console.error("Erro interno:", err);
    res.status(500).json({ error: "Erro no servidor ao cancelar reserva." });
  }
});
export default router;
