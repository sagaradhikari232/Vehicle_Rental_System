/**
 * ToastContainer.jsx
 * src/components/common/ToastContainer.jsx
 *
 * Lightweight toast renderer — zero external dependencies.
 * Matches the orange/emerald/red design language of the project.
 *
 * Usage:
 *   const { toasts, toast, dismiss } = useToast();
 *   <ToastContainer toasts={toasts} onDismiss={dismiss} />
 *
 *   toast('Saved!', 'success')
 *   toast('Something went wrong', 'error')
 *   toast('Note:', 'info')
 */
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-red-500 flex-shrink-0"     />,
  info:    <AlertCircle  className="w-5 h-5 text-orange-400 flex-shrink-0"  />,
};

const BORDER = {
  success: 'border-emerald-100',
  error:   'border-red-100',
  info:    'border-orange-100',
};

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-start gap-3 bg-white
            border ${BORDER[t.type] ?? 'border-gray-100'}
            rounded-2xl px-4 py-3.5
            shadow-xl shadow-black/10
            pointer-events-auto
          `}
        >
          {ICONS[t.type] ?? ICONS.info}
          <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">
            {t.message}
          </p>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors -mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}