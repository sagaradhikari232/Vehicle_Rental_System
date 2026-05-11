/**
 * ProfileForm.jsx
 * src/components/pages/account/ProfileForm.jsx
 *
 * Backend contract (updateAccountDetails):
 *   Accepts:  { fullName (capital N), email, phone, address }
 *   address:  { province, district, municipality, wardNumber, tole }
 *   Returns:  updated user with field `fullname` (lowercase n)
 *
 * Important field name split:
 *   Backend stores → fullname (lowercase)
 *   Backend reads  → fullName (capital N)  ← controller destructures this
 *   Form state     → fullName (capital N)  ← we send what the controller reads
 *
 * Fields NOT updatable via this endpoint (backend doesn't accept):
 *   username — shown read-only
 *   role     — shown read-only
 */
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, Hash, TreePine,
} from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { validateProfileForm } from '../../../utils/validators';

const NEPAL_PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
];

export default function ProfileForm({ profile, saving, onSave }) {
  const [form,    setForm]    = useState(buildForm(profile));
  const [errors,  setErrors]  = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Re-sync when profile loads from API (initial fetch completes after mount)
  useEffect(() => {
    setForm(buildForm(profile));
    setIsDirty(false);
    setErrors({});
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setIsDirty(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfileForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Build the address object — only include non-empty values
    const addressPayload = {};
    const a = form.address;
    if (a.province)    addressPayload.province    = a.province;
    if (a.district)    addressPayload.district    = a.district;
    if (a.municipality) addressPayload.municipality = a.municipality;
    if (a.wardNumber)  addressPayload.wardNumber  = Number(a.wardNumber);
    if (a.tole)        addressPayload.tole        = a.tole;

    const result = await onSave({
      fullName: form.fullName,    // capital N — what the controller destructures
      email:    form.email,
      phone:    form.phone,
      address:  addressPayload,
    });

    if (result.success) setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal details. Username and role cannot be changed.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Read-only identity strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-0.5">Username</p>
            <p className="text-sm font-semibold text-gray-700">
              @{profile?.username ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-0.5">Role</p>
            <span className="inline-block text-xs font-bold uppercase tracking-wider
              bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full capitalize">
              {profile?.role ?? 'customer'}
            </span>
          </div>
        </div>

        {/* ── Editable fields ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">

          {/* Full Name — field name `fullName` (capital N) */}
          <InputWithIcon icon={User} top="38px">
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
          </InputWithIcon>

          {/* Email */}
          <InputWithIcon icon={Mail} top="38px">
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          </InputWithIcon>

          {/* Phone */}
          <InputWithIcon icon={Phone} top="38px">
            <Input
              label="Phone Number"
              id="phone"
              name="phone"
              type="tel"
              placeholder="+977 98XXXXXXXX"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </InputWithIcon>

          {/* Province — Nepal-specific dropdown */}
          <div className="w-full mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1.5">
              Province
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                id="province"
                name="province"
                value={form.address.province}
                onChange={handleAddressChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm
                           transition-all outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500
                           hover:border-gray-400 text-gray-800 appearance-none cursor-pointer"
              >
                <option value="">Select province</option>
                {NEPAL_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* District */}
          <InputWithIcon icon={Building2} top="38px">
            <Input
              label="District"
              id="district"
              name="district"
              type="text"
              placeholder="e.g. Rupandehi"
              value={form.address.district}
              onChange={handleAddressChange}
              error={errors.district}
            />
          </InputWithIcon>

          {/* Municipality */}
          <InputWithIcon icon={Building2} top="38px">
            <Input
              label="Municipality / VDC"
              id="municipality"
              name="municipality"
              type="text"
              placeholder="e.g. Butwal Sub-Metropolitan"
              value={form.address.municipality}
              onChange={handleAddressChange}
              error={errors.municipality}
            />
          </InputWithIcon>

          {/* Ward Number */}
          <InputWithIcon icon={Hash} top="38px">
            <Input
              label="Ward Number"
              id="wardNumber"
              name="wardNumber"
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={form.address.wardNumber}
              onChange={handleAddressChange}
              error={errors.wardNumber}
            />
          </InputWithIcon>

          {/* Tole */}
          <InputWithIcon icon={TreePine} top="38px">
            <Input
              label="Tole / Street"
              id="tole"
              name="tole"
              type="text"
              placeholder="e.g. Thamel"
              value={form.address.tole}
              onChange={handleAddressChange}
              error={errors.tole}
            />
          </InputWithIcon>

        </div>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
          {isDirty && (
            <p className="text-xs text-orange-500 font-medium">
              You have unsaved changes.
            </p>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              variant="primary"
              isLoading={saving}
              disabled={!isDirty || saving}
              className="min-w-[140px]"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build form state from the profile object.
 * Backend returns `fullname` (lowercase) — we map it to `fullName` (capital N)
 * because that's what the update controller expects.
 */
function buildForm(profile) {
  return {
    fullName: profile?.fullname ?? '',          // lowercase from DB → capital N for form
    email:    profile?.email    ?? '',
    phone:    profile?.phone    ?? '',
    address: {
      province:     profile?.address?.province     ?? '',
      district:     profile?.address?.district     ?? '',
      municipality: profile?.address?.municipality ?? '',
      wardNumber:   profile?.address?.wardNumber   ?? '',
      tole:         profile?.address?.tole         ?? '',
    },
  };
}

/**
 * Wrapper that positions a Lucide icon inside the Input's left padding.
 * The Input component renders its own <input> — we overlay the icon absolutely.
 */
function InputWithIcon({ icon: Icon, top = '38px', children }) {
  return (
    <div className="relative">
      <Icon
        className="absolute left-3 z-10 w-4 h-4 text-gray-400 pointer-events-none"
        style={{ top }}
      />
      {/* Input component already has px-4; we override left padding via className */}
      <div className="[&_input]:pl-10">
        {children}
      </div>
    </div>
  );
}