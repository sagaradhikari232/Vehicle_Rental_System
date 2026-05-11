/**
 * accountApi.js
 * src/utils/accountApi.js
 *
 * Every call maps 1-to-1 to the actual backend routes in user.routes.js:
 *
 *   GET    /api/v1/users/current-user          → getCurrentUser
 *   PATCH  /api/v1/users/update-account        → updateAccountDetails
 *   PATCH  /api/v1/users/avatar                → updateUserAvatar  (multipart)
 *   PATCH  /api/v1/users/change-password       → changeCurrentPassword
 *   GET    /api/v1/bookings/my?limit=N          → recent bookings (assumed route)
 *
 * Routes that do NOT exist on the backend (no stats, no wishlist, no avatar DELETE)
 * are intentionally absent — the hook handles their absence gracefully.
 */
import api from './api';

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /users/current-user
 * Returns the authenticated user object (minus password & refreshToken).
 * Fields: fullname, email, username, avatar, phone, role, address, createdAt, status
 */
export const getMyProfile = () => api.get('/users/current-user');

/**
 * PATCH /users/update-account
 * Backend reads: fullName (capital N), email, phone, address (nested object)
 * Note: stored in DB as `fullname` but the controller destructures `fullName`
 *
 * @param {object} data - { fullName, email, phone, address }
 */
export const updateProfile = (data) => api.patch('/users/update-account', data);

/**
 * PATCH /users/avatar
 * Multer expects the field name "avatar" (single file).
 * Returns updated user object.
 *
 * @param {FormData} formData - must contain field "avatar"
 */
export const uploadProfileImage = (formData) =>
  api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Security ─────────────────────────────────────────────────────────────────

/**
 * PATCH /users/change-password
 * Backend destructures: { oldPassword, newPassword }
 * (NOT currentPassword — that field name only existed in the old frontend)
 *
 * @param {object} data - { oldPassword, newPassword }
 */
export const changePassword = (data) => api.patch('/users/change-password', data);

// ─── Activity ─────────────────────────────────────────────────────────────────

/**
 * GET /bookings/my?limit=N
 * Fetch the authenticated user's recent bookings.
 * If this route doesn't exist yet, the hook catches the 404 silently.
 */
export const getRecentBookings = (limit = 5) =>
  api.get(`/bookings/my?limit=${limit}`);