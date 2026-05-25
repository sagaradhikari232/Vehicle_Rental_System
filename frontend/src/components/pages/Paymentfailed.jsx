import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import api from '../../utils/api'; // adjust path to your api.js

const REASON_MESSAGES = {
  user_canceled:      'You cancelled the payment. No amount was deducted.',
  expired:            'Your payment session expired. Please try again.',
  failed:             'Payment could not be processed. Please try again.',
  missing_pidx:       'Invalid payment session. Please go back and retry.',
  payment_not_found:  'Payment record not found. Contact support if amount was deducted.',
};

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const bookingId = params.get('bookingId');
  const reason    = params.get('reason') ?? 'failed';
  const message   = REASON_MESSAGES[reason] ?? REASON_MESSAGES.failed;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);


const handleRetry = async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await api.post(`/payments/initiate/${bookingId}`);
    window.location.href = res.data.payment_url;

  } catch (err) {
    if (err.response?.status === 409) {
      const { payment_url } = err.response.data;
      if (payment_url) {
        window.location.href = payment_url;
        return;
      }
    }
    setError(err.response?.data?.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-red-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl shadow-rose-200/50 p-10 max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-rose-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Failed</h1>
          <p className="text-slate-500 mt-2 text-sm">{message}</p>
        </div>

        {/* Info box */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Reason</span>
            <span className="font-bold text-rose-600 capitalize">{reason.replace('_', ' ')}</span>
          </div>
          {bookingId && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Booking ID</span>
              <span className="font-mono font-bold text-slate-700 text-xs">#{bookingId.slice(-10)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 text-xs text-slate-400">
            No amount has been deducted unless your bank statement shows otherwise. Contact support if needed.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-rose-500 font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {bookingId && (
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Redirecting to Khalti...' : 'Retry Payment'}
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            <Home size={16} /> Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}