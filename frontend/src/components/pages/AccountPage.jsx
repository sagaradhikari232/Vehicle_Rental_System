import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import useProfile, { useToast } from '../../hooks/useProfile';
import ToastContainer   from '../common/ToastContainer';
import ProfileSkeleton  from './account/ProfileSkeleton';
import ProfileHeader    from './account/ProfileHeader';
import ProfileForm      from './account/ProfileForm';
import SecuritySettings from './account/SecuritySettings';

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Hard guard in case ProtectedRoute is bypassed
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    profile,
    stats,
    recentBookings,
    loadingProfile,
    loadingActivity,
    savingProfile,
    savingPassword,
    uploadingAvatar,
    profileError,
    saveProfile,
    saveAvatar,
    updatePassword,
  } = useProfile();

  const { toasts, toast, dismiss } = useToast();

  // ── Handler wrappers (add toast then forward result) ──────────────────────
  const handleAvatarChange = async (file) => {
    const result = await saveAvatar(file);
    toast(result.message, result.success ? 'success' : 'error');
  };

  const handleSaveProfile = async (formData) => {
    const result = await saveProfile(formData);
    toast(result.message, result.success ? 'success' : 'error');
    return result; // ProfileForm needs this to clear isDirty on success
  };

  const handleSavePassword = async (payload) => {
    const result = await updatePassword(payload);
    toast(result.message, result.success ? 'success' : 'error');
    return result; // SecuritySettings needs this to reset form on success
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (!loadingProfile && profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Could not load your profile
          </h2>
          <p className="text-sm text-gray-500 mb-5">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white
                       text-sm font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <StickyHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">

        {/* 1 — Avatar / cover / name / quick stats */}
        <ProfileHeader
          profile={profile}
          stats={stats}
          uploadingAvatar={uploadingAvatar}
          onAvatarChange={handleAvatarChange}
          onToast={toast}
        />
        {/* 3 — Editable profile fields */}
        <ProfileForm
          profile={profile}
          saving={savingProfile}
          onSave={handleSaveProfile}
        />

        {/* 4 — Change password */}
        <SecuritySettings
          saving={savingPassword}
          onSave={handleSavePassword}
        />
      </main>
    </div>
  );
}

// ── Sticky top bar ─────────────────────────────────────────────────────────────
function StickyHeader() {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 rounded-xl border border-gray-200 text-gray-500
                     hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50
                     transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-none">My Account</h1>
          <p className="text-xs text-gray-400 mt-0.5">Profile &amp; settings</p>
        </div>
      </div>
    </div>
  );
}