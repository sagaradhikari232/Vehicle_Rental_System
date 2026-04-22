import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  initiatePayment,
  khaltiCallback,
  verifyPayment,
  getPaymentByBooking,
  getAllPayments,
} from "../controllers/payment.controller.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────
// Khalti redirects the user's browser to this URL after payment —
// must be public (no JWT) because Khalti controls the redirect.
router.get("/callback", khaltiCallback);

// ── Authenticated user ─────────────────────────────────────────
router.post("/initiate/:bookingId", verifyJWT, initiatePayment);
router.post("/verify", verifyJWT, verifyPayment);
router.get("/booking/:bookingId", verifyJWT, getPaymentByBooking);

// ── Admin only ─────────────────────────────────────────────────
router.get("/", verifyJWT, isAdmin, getAllPayments);

export default router;