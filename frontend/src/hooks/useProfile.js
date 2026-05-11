/**
 * useProfile.js
 * src/hooks/useProfile.js
 *
 * Central data hook for the Account page.
 *
 * Backend contract (from user.controller.js + user.routes.js):
 *
 *  GET    /users/current-user       → { data: user }
 *                                      user fields: fullname, email, username,
 *                                      avatar, phone, role, address, createdAt, status
 *
 *  PATCH  /users/update-account     → sends { fullName, email, phone, address }
 *                                      returns updated user (no password)
 *
 *  PATCH  /users/avatar             → multipart, field name "avatar"
 *                                      returns updated user (no password)
 *
 *  PATCH  /users/change-password    → sends { oldPassword, newPassword }
 *                                      returns {} on success
 *
 *  GET    /bookings/my?limit=N      → recent bookings (gracefully skipped if 404)
 *
 *  No stats endpoint, no wishlist endpoint, no avatar DELETE — handled gracefully.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  getRecentBookings,
} from '../utils/accountApi';

// ─── useToast ──────────────────────────────────────────────────────────────────
const TOAST_DURATION = 3500;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast: push, dismiss };
}

// ─── Derive stats from bookings array ─────────────────────────────────────────
function deriveStats(bookings = [], profile = null) {
  const total      = bookings.length;
  const active     = bookings.filter((b) => b.status === 'active').length;
  const completed  = bookings.filter((b) => b.status === 'completed').length;
  const cancelled  = bookings.filter((b) => b.status === 'cancelled').length;
  const memberDays = profile?.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    totalRentals:      total,
    activeRentals:     active,
    completedRentals:  completed,
    cancelledBookings: cancelled,
    favoriteVehicles:  0,   // no backend route yet
    memberDays,
  };
}

// ─── Main Hook ─────────────────────────────────────────────────────────────────
export default function useProfile() {
  const { login } = useAuth();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [profile,        setProfile]        = useState(null);
  const [stats,          setStats]          = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  // ── Loading state ──────────────────────────────────────────────────────────
  const [loadingProfile,  setLoadingProfile]  = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // ── Mutation loading state ─────────────────────────────────────────────────
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Error state ────────────────────────────────────────────────────────────
  const [profileError, setProfileError] = useState(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // Profile and bookings in parallel — bookings failure won't block profile
        const [profileRes, bookingsRes] = await Promise.allSettled([
          getMyProfile(),
          getRecentBookings(10), // fetch 10 so we can derive richer stats
        ]);

        if (cancelled) return;

        // ── Profile ──────────────────────────────────────────────────────
        if (profileRes.status === 'fulfilled') {
          // Backend wraps in ApiResponse: { statusCode, data, message }
          const userData = profileRes.value.data?.data ?? profileRes.value.data;
          setProfile(userData);
          setLoadingProfile(false);

          // ── Bookings + derived stats ──────────────────────────────────
          let bookings = [];
          if (bookingsRes.status === 'fulfilled') {
            const raw =
              bookingsRes.value.data?.data ??
              bookingsRes.value.data?.bookings ??
              bookingsRes.value.data ??
              [];
            bookings = Array.isArray(raw) ? raw : [];
            setRecentBookings(bookings.slice(0, 5)); // show only 5 in UI
          }
          // Derive stats from what we have (works even if bookings 404'd)
          setStats(deriveStats(bookings, userData));
        } else {
          setProfileError('Failed to load your profile. Please try again.');
          setLoadingProfile(false);
        }

        setLoadingActivity(false);
      } catch {
        if (!cancelled) {
          setProfileError('Something went wrong. Please refresh the page.');
          setLoadingProfile(false);
          setLoadingActivity(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── saveProfile ────────────────────────────────────────────────────────────
  /**
   * Sends PATCH /users/update-account
   * Maps form field `fullName` (capital N) as required by the controller.
   * Optimistic update with rollback on failure.
   */
  const saveProfile = useCallback(async (formData) => {
    setSavingProfile(true);
    const previous = profile;

    // Optimistic local update
    setProfile((prev) => ({
      ...prev,
      // Controller stores as `fullname` but we mirror what came back from API
      fullname: formData.fullName,
      email:    formData.email,
      phone:    formData.phone,
      address:  formData.address,
    }));

    try {
      const res = await updateProfile({
        fullName: formData.fullName,   // ← capital N: what controller destructures
        email:    formData.email,
        phone:    formData.phone,
        address:  formData.address,    // nested object
      });

      const updated = res.data?.data ?? res.data;
      setProfile(updated);

      // Keep AuthContext localStorage in sync
      login(updated, localStorage.getItem('accessToken'));

      setSavingProfile(false);
      return { success: true, message: 'Profile updated successfully.' };
    } catch (err) {
      setProfile(previous); // rollback optimistic update
      setSavingProfile(false);
      const msg =
        err.response?.data?.message ?? 'Failed to update profile. Please try again.';
      return { success: false, message: msg };
    }
  }, [profile, login]);

  // ── saveAvatar ─────────────────────────────────────────────────────────────
  /**
   * Sends PATCH /users/avatar (multipart, field name "avatar")
   * Controller: updateUserAvatar — returns updated user
   */
  const saveAvatar = useCallback(async (file) => {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file); // field name must match multer upload.single("avatar")

    try {
      const res = await uploadProfileImage(formData);
      const updated = res.data?.data ?? res.data;
      // Update only the avatar field locally
      setProfile((prev) => ({ ...prev, avatar: updated?.avatar ?? prev?.avatar }));
      setUploadingAvatar(false);
      return { success: true, message: 'Profile photo updated successfully.' };
    } catch (err) {
      setUploadingAvatar(false);
      const msg = err.response?.data?.message ?? 'Failed to upload photo.';
      return { success: false, message: msg };
    }
  }, []);

  // ── updatePassword ─────────────────────────────────────────────────────────
  /**
   * Sends PATCH /users/change-password
   * Controller destructures: { oldPassword, newPassword }
   */
  const updatePassword = useCallback(async ({ oldPassword, newPassword }) => {
    setSavingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSavingPassword(false);
      return { success: true, message: 'Password changed successfully.' };
    } catch (err) {
      setSavingPassword(false);
      const msg =
        err.response?.data?.message ?? 'Incorrect current password. Please try again.';
      return { success: false, message: msg };
    }
  }, []);

  return {
    // Data
    profile,
    stats,
    recentBookings,
    // Loading
    loadingProfile,
    loadingActivity,
    // Mutation loading
    savingProfile,
    savingPassword,
    uploadingAvatar,
    // Error
    profileError,
    // Actions
    saveProfile,
    saveAvatar,
    updatePassword,
  };
}