/**
 * SecuritySettings.jsx
 * src/components/pages/account/SecuritySettings.jsx
 *
 * Backend contract (changeCurrentPassword):
 *   Endpoint: PATCH /users/change-password
 *   Expects:  { oldPassword, newPassword }   ← exact field names from controller
 *   Returns:  {} with message "Password changed successfully"
 *   Error cases:
 *     400 — oldPassword === newPassword ("Password is same as before")
 *     400 — invalid old password ("Invalid old password")
 *
 * The form has a third field `confirmPassword` for UX only — never sent to API.
 */
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { validatePasswordForm, getPasswordStrength } from '../../../utils/validators';

const INITIAL_FORM = {
  oldPassword:     '',
  newPassword:     '',
  confirmPassword: '',
};

export default function SecuritySettings({ saving, onSave }) {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const strength = getPasswordStrength(form.newPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePasswordForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Send only the two fields the backend expects
    const result = await onSave({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });

    if (result.success) {
      setForm(INITIAL_FORM);
      setErrors({});
    } else {
      // Surface backend error on oldPassword field (most likely "Invalid old password")
      setErrors({ oldPassword: result.message });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-50 flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Change your password. Choose something strong and unique.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-md">

        {/* Current password — field name `oldPassword` matching backend */}
        <Input
          label="Current Password"
          id="oldPassword"
          name="oldPassword"
          type="password"
          placeholder="Your current password"
          value={form.oldPassword}
          onChange={handleChange}
          error={errors.oldPassword}
          autoComplete="current-password"
        />

        {/* New password */}
        <Input
          label="New Password"
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="At least 8 characters"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          autoComplete="new-password"
        />

        {/* Strength meter — only visible once user starts typing */}
        {form.newPassword && (
          <div className="mb-4 -mt-2">
            <div className="flex gap-1 mb-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < strength.score ? strength.color : 'bg-gray-100'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-semibold ${strengthTextColor(strength.score)}`}>
              {strength.label}
            </p>
          </div>
        )}

        {/* Confirm password */}
        <Input
          label="Confirm New Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repeat new password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {/* Requirements checklist */}
        <ul className="mb-5 space-y-1.5">
          {[
            { met: form.newPassword.length >= 8,                              label: 'At least 8 characters' },
            { met: /[A-Z]/.test(form.newPassword),                            label: 'One uppercase letter'  },
            { met: /[a-z]/.test(form.newPassword),                            label: 'One lowercase letter'  },
            { met: /\d/.test(form.newPassword),                               label: 'One number'            },
            { met: form.newPassword === form.confirmPassword && !!form.confirmPassword, label: 'Passwords match' },
          ].map(({ met, label }) => (
            <li
              key={label}
              className={`flex items-center gap-2 text-xs font-medium transition-colors duration-200 ${
                met ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                met ? 'bg-emerald-500' : 'bg-gray-300'
              }`} />
              {label}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          variant="primary"
          isLoading={saving}
          disabled={saving}
          className="w-full sm:w-auto min-w-[180px]"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}

function strengthTextColor(score) {
  if (score <= 1) return 'text-red-500';
  if (score === 2) return 'text-orange-500';
  if (score === 3) return 'text-yellow-600';
  return 'text-emerald-600';
}