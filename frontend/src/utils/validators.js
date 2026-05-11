/**
 * validators.js
 * src/utils/validators.js
 *
 * Pure validation functions — no side effects, no imports.
 * Field names match the backend controller exactly.
 * Returns an errors object (field → message string). Empty object = all valid.
 */

// ─── Profile Form ─────────────────────────────────────────────────────────────
/**
 * Validates the profile edit form.
 * Backend updateAccountDetails requires: fullName (capital N), email
 * Optional: phone, address fields
 */
export function validateProfileForm(values) {
  const errors = {};

  // fullName — required, maps to backend `fullName` (controller destructures this)
  if (!values.fullName?.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  // username — read-only display only, not sent to updateAccountDetails
  // (backend doesn't update username after registration)

  // email — required by backend
  if (!values.email?.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  // phone — optional but validated if provided
  if (values.phone && !/^[+]?[\d\s\-()]{7,15}$/.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  // address fields — all optional
  if (values.wardNumber && isNaN(Number(values.wardNumber))) {
    errors.wardNumber = 'Ward number must be a number.';
  }

  return errors;
}

// ─── Password Form ────────────────────────────────────────────────────────────
/**
 * Validates the change-password form.
 * Backend expects: oldPassword, newPassword (exact field names)
 * Frontend also has confirmPassword for UX — validated here, not sent to API.
 */
export function validatePasswordForm(values) {
  const errors = {};

  if (!values.oldPassword) {
    errors.oldPassword = 'Current password is required.';
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required.';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.newPassword)) {
    errors.newPassword =
      'Password must contain uppercase, lowercase, and a number.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  // Backend also checks: oldPassword === newPassword → 400
  if (
    values.oldPassword &&
    values.newPassword &&
    values.oldPassword.trim() === values.newPassword.trim()
  ) {
    errors.newPassword = 'New password must be different from your current password.';
  }

  return errors;
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

/**
 * Validates a File object before upload.
 * Returns an error string, or null if valid.
 */
export function validateImageFile(file) {
  if (!file) return 'Please select a file.';
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WebP, or GIF files are allowed.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File must be smaller than ${MAX_SIZE_MB}MB.`;
  }
  return null; // null = valid
}

// ─── Password Strength ────────────────────────────────────────────────────────
/**
 * Returns { score: 0–5, label, color } for a visual strength meter.
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password))   score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak',   color: 'bg-red-500'     },
    { label: 'Weak',        color: 'bg-orange-400'   },
    { label: 'Fair',        color: 'bg-yellow-400'   },
    { label: 'Strong',      color: 'bg-emerald-400'  },
    { label: 'Very Strong', color: 'bg-emerald-600'  },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}