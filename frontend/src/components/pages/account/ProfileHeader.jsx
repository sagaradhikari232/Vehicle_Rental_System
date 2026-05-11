/**
 * ProfileHeader.jsx
 * src/components/pages/account/ProfileHeader.jsx
 *
 * Backend field mapping (from getCurrentUser / updateUserAvatar):
 *   user.fullname   — lowercase n (how MongoDB stores it)
 *   user.username
 *   user.email
 *   user.avatar     — Cloudinary URL
 *   user.role
 *   user.createdAt
 *
 * No avatar DELETE route exists on the backend, so the "Remove" button
 * is intentionally absent.
 */
import React, { useRef } from 'react';
import { Camera, Loader2, BadgeCheck } from 'lucide-react';
import { validateImageFile } from '../../../utils/validators';

export default function ProfileHeader({
  profile,
  stats,
  uploadingAvatar,
  onAvatarChange,
  onToast,
}) {
  const fileInputRef = useRef(null);

  // Backend stores as `fullname` (lowercase n)
  const displayName = profile?.fullname ?? profile?.username ?? 'User';
  const avatarUrl   = profile?.avatar ?? null;
  const initials    = getInitials(displayName);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year:  'numeric',
      })
    : '—';

  // ── File handlers ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) { onToast(error, 'error'); return; }
    onAvatarChange(file);
    e.target.value = ''; // allow re-selecting same file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) { onToast(error, 'error'); return; }
    onAvatarChange(file);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Cover gradient ──────────────────────────────────────────────────── */}
      <div className="h-32 sm:h-44 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden">
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="px-6 sm:px-8 pb-6">
        {/* ── Avatar + action row ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-16">

          {/* Avatar */}
          <div
            className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            title="Click or drag to change photo"
          >
            {/* Image or initials */}
            <div className="w-full h-full rounded-2xl ring-4 ring-white shadow-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-orange-500 select-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Hover overlay (camera icon) */}
            {!uploadingAvatar && (
              <div className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <Camera className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            )}

            {/* Upload spinner overlay */}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Upload profile photo"
            />
          </div>

          {/* Change photo button */}
          <div className="sm:mb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white text-sm font-semibold transition-colors duration-200 shadow-sm shadow-orange-200"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <span>{uploadingAvatar ? 'Uploading…' : 'Change Photo'}</span>
            </button>
            <p className="text-xs text-gray-400 mt-1.5 hidden sm:block">
              JPG, PNG or WebP · max 5MB
            </p>
          </div>
        </div>

        {/* ── Name + role ─────────────────────────────────────────────────────── */}
        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900">{displayName}</h1>
            {profile?.status === 'active' && (
              <BadgeCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
            )}
            {profile?.role && (
              <span className="text-[11px] font-bold uppercase tracking-wider
                bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full">
                {profile.role}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">@{profile?.username ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
        </div>

        {/* ── Quick 3-stat strip ──────────────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {[
            { label: 'Total Rentals', value: stats?.totalRentals ?? '—' },
            { label: 'Active',        value: stats?.activeRentals ?? '—' },
            { label: 'Completed',     value: stats?.completedRentals ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-lg font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}