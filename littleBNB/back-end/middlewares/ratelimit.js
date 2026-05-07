// middlewares/rateLimit.js
import rateLimit from "express-rate-limit";

export const bookingReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: "Muitas requisições. Tente novamente em 1 minuto." },
});

export const bookingCreateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Você tentou criar reservas muitas vezes. Aguarde 1 minuto." },
});

export const bookingDeleteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: "Muitos cancelamentos em pouco tempo. Aguarde 1 minuto." },
});