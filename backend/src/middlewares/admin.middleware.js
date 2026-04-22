import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────
// @desc    Restrict route to admin role only
// @usage   router.get("/", verifyJWT, isAdmin, handler)
//          Always chain AFTER verifyJWT — relies on req.user being set.
// ─────────────────────────────────────────────
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
  next();
});

// ─────────────────────────────────────────────
// @desc    Restrict route to owner role only
// @usage   router.get("/", verifyJWT, isOwner, handler)
// ─────────────────────────────────────────────
export const isOwner = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "owner") {
    throw new ApiError(403, "Access denied. Owners only.");
  }
  next();
});

// ─────────────────────────────────────────────
// @desc    Restrict route to admin OR owner
// @usage   For routes where both roles have access (e.g. vehicle management)
// ─────────────────────────────────────────────
export const isAdminOrOwner = asyncHandler(async (req, res, next) => {
  if (!["admin", "owner"].includes(req.user?.role)) {
    throw new ApiError(403, "Access denied. Admins and owners only.");
  }
  next();
});