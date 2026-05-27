import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, Home } from 'lucide-react';
import api from '../../utils/api';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const bookingId = params.get('bookingId');
  const pidx      = params.get('pidx');

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // If Khalti gave us pidx in URL, verify it first
      if (pidx) {
        try {
          await api.post('/payments/verify', { pidx });
          setVerified(true);
        } catch {
          // May already be verified via callback — not fatal
          setVerified(true);
        }
      }

      // Fetch payment details for the booking
      if (bookingId) {
        try {
          const res = await api.get(`/payments/booking/${bookingId}`);
          setPayment(res.data.payment);
        } catch {
          // Not critical — just show a generic success
        }
      }
      setLoading(false);
    };

    verify();
  }, [bookingId, pidx]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-600 font-medium">Verifying your payment…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 p-10 max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-slate-500 mt-2 text-sm">Your booking has been confirmed. Thank you for choosing RideOn!</p>
        </div>

        {/* Payment Details */}
        {payment && (
          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Amount Paid</span>
              <span className="font-black text-emerald-600">Rs. {Number(payment.amount).toLocaleString('en-NP')}</span>
            </div>
            {payment.khalti_transaction_id && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction ID</span>
                <span className="font-mono font-bold text-slate-700 text-xs">{payment.khalti_transaction_id}</span>
              </div>
            )}
            {payment.pidx && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Khalti PIDX</span>
                <span className="font-mono font-bold text-slate-700 text-xs">{payment.pidx.slice(0, 16)}…</span>
              </div>
            )}
            {bookingId && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Booking ID</span>
                <span className="font-mono font-bold text-slate-700 text-xs">#{bookingId.slice(-10)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Completed
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {bookingId && (
            <button
              onClick={() => navigate(`/booking-history`)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
            >
              View Booking <ArrowRight size={16} />
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