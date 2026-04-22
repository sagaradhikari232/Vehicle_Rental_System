import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  activateBooking,
  completeBooking,
  updatePaymentStatus,
  checkAvailability,
} from "../controllers/booking.controller.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────
// Must be before /:id to avoid "availability" being caught as an id param
router.get("/availability", checkAvailability);

// ── Authenticated user ─────────────────────────────────────────
router.post("/", verifyJWT, createBooking);
router.get("/my", verifyJWT, getMyBookings);
router.get("/:id", verifyJWT, getBookingById);
router.patch("/:id", verifyJWT, updateBooking);
router.patch("/:id/cancel", verifyJWT, cancelBooking);

// ── Admin only ─────────────────────────────────────────────────
router.get("/", verifyJWT, isAdmin, getAllBookings);
router.patch("/:id/confirm", verifyJWT, isAdmin, confirmBooking);
router.patch("/:id/activate", verifyJWT, isAdmin, activateBooking);
router.patch("/:id/complete", verifyJWT, isAdmin, completeBooking);
router.patch("/:id/payment-status", verifyJWT, isAdmin, updatePaymentStatus);

export default router;