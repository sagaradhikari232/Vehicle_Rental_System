import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, 
  Car, 
  CheckCircle2,
  XCircle, 
  Clock, 
  Hourglass, 
  RefreshCw, 
  Receipt, 
  Ban,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

import Card from '../common/Card';
import Button from '../common/Button';
import api from '../../utils/api';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Hourglass,
    pill: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    pill: 'bg-green-100 text-green-700 border border-green-200',
  },
  active: {
    label: 'Active',
    icon: Car,
    pill: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    pill: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    pill: 'bg-red-100 text-red-600 border border-red-200',
  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 max-w-sm ${
        type === 'success'
          ? 'bg-gradient-to-r from-green-500 to-green-600'
          : type === 'warning'
          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
          : 'bg-gradient-to-r from-red-500 to-red-600'
      }`}
    >
      <span className="shrink-0 mt-0.5">
        {type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {type === 'warning' && <AlertTriangle className="w-4 h-4" />}
        {type === 'error'   && <XCircle className="w-4 h-4" />}
      </span>
      <span className="leading-snug">{message}</span>
    </div>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-gray-100 shadow-lg overflow-hidden animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-px bg-gray-100 my-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-full" />
      <div className="h-4 bg-gray-100 rounded-lg w-full" />
      <div className="h-10 bg-gray-200 rounded-lg mt-4" />
    </div>
  </div>
);

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onCancelClick, cancellingId, onPayError }) => {
  const [hovered, setHovered] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const bookingId = booking._id || booking.id;
  const isCancelling = cancellingId === bookingId;

  const isPending   = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const canCancel   = isPending || isConfirmed;

  const redirectToPayment = (url) => { window.location.href = url; };

  const handlePayNow = async () => {
    setInitiatingPayment(true);
    try {
      const res = await api.post(`/payments/initiate/${bookingId}`);
      const freshUrl = res.data?.data?.payment_url ?? res.data?.payment_url;
      if (freshUrl) {
        redirectToPayment(freshUrl);
      } else {
        onPayError('Payment URL not received. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      const isAlreadyInProgress =
        msg.toLowerCase().includes('already in progress') ||
        err.response?.status === 409;

      if (isAlreadyInProgress) {
        try {
          const existing = await api.get(`/payments/booking/${bookingId}`);
          const existingUrl =
            existing.data?.data?.payment_url ?? existing.data?.payment_url;
          if (existingUrl) {
            redirectToPayment(existingUrl);
            return;
          }
        } catch {
          // fall through
        }
        onPayError('Could not retrieve existing payment. Please try again.');
      } else {
        onPayError(msg || 'Failed to initiate payment. Please try again.');
      }
    } finally {
      setInitiatingPayment(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const formatDuration = (hours) => {
    if (!hours || hours <= 0) return '—';
    const totalHours = Math.round(hours);
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    if (days === 0) return `${remainingHours} hrs`;
    if (remainingHours === 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
    return `${days} ${days === 1 ? 'day' : 'days'} ${remainingHours} hrs`;
  };

  return (
    <Card
      hover
      gradient
      className="overflow-hidden flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Vehicle image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={booking.vehicle?.image_url}
          alt={`${booking.vehicle?.brand} ${booking.vehicle?.model}`}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            hovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          {booking.vehicle?.type}
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {formatDuration(booking.duration_hours)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{booking.vehicle?.type}</p>
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.pill}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {[
            { label: 'Pickup', value: booking.pickup_datetime },
            { label: 'Return', value: booking.dropoff_datetime },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{label}</span>
                <span className="font-medium text-gray-700">{formatDate(value)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Rs.{Math.round(booking.payment?.amount ?? booking.grand_total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Booking ID</p>
              <p className="text-xs font-mono text-gray-500">#{bookingId}</p>
            </div>
          </div>

          {booking.payment_status && (
            <div className="flex items-center gap-1.5 mb-3">
              <Receipt className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Payment:{' '}
                <span className="font-semibold capitalize text-gray-700">
                  {booking.payment_status}
                </span>
              </span>
            </div>
          )}

          {isPending && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                isLoading={initiatingPayment}
                onClick={handlePayNow}
              >
                {!initiatingPayment && <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
                Pay Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                isLoading={isCancelling}
                disabled={initiatingPayment}
                onClick={() => onCancelClick(bookingId)}
              >
                {!isCancelling && <Ban className="w-3.5 h-3.5 mr-1.5" />}
                Cancel
              </Button>
            </div>
          )}

          {isConfirmed && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
              isLoading={isCancelling}
              onClick={() => onCancelClick(bookingId)}
            >
              {!isCancelling && <Ban className="w-3.5 h-3.5 mr-1.5" />}
              Cancel Booking
            </Button>
          )}

          {!canCancel && (
            <button
              disabled
              className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            >
              {booking.status === 'cancelled' ? 'Booking Cancelled' : 'Not Cancellable'}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({ onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const MAX = 500;

  const handleConfirm = () => onConfirm(reason.trim() || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-gray-100">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <Ban className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Cancel Booking?
        </h3>
        <p className="text-gray-500 text-sm text-center mb-5">
          This action cannot be undone. Your booking will be permanently cancelled.
        </p>

        {/* Cancellation reason */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={MAX}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why you're cancelling..."
            className="w-full px-3 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400 transition"
          />
          <p className={`text-xs mt-1 text-right ${reason.length >= MAX ? 'text-red-500' : 'text-gray-400'}`}>
            {reason.length}/{MAX}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <Button
            size="sm"
            variant="primary"
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            onClick={handleConfirm}
          >
            Yes, Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Tab ───────────────────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
      active
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
    }`}
  >
    {label}
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
      {count}
    </span>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingHistory() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showModalFor, setShowModalFor] = useState(null);
  const [toast, setToast]               = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings/my');
      const data = res.data?.data ?? res.data?.bookings ?? res.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelClick = (id) => setShowModalFor(id);
  const closeModal = () => setShowModalFor(null);

  // reason comes from the modal's textarea
  const confirmCancel = async (reason) => {
    if (!showModalFor) return;
    const bookingId = showModalFor;
    setCancellingId(bookingId);
    setShowModalFor(null);

    try {
      const body = reason ? { cancellation_reason: reason } : {};
      const res = await api.patch(`/bookings/${bookingId}/cancel`, body);

      // Update local status to cancelled
      setBookings((prev) =>
        prev.map((b) =>
          (b._id || b.id) === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );

      // If the booking had a completed payment, inform user a refund is pending
      if (res.data?.refund_required) {
        setToast({
          message: 'Booking cancelled. A refund has been initiated and will be processed within 5–7 business days.',
          type: 'warning',
        });
      } else {
        setToast({ message: 'Booking cancelled successfully.', type: 'success' });
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to cancel. Please try again.',
        type: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const FILTER_OPTIONS = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'];

  const filteredBookings =
    activeFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  const countFor = (status) =>
    status === 'all'
      ? bookings.length
      : bookings.filter((b) => b.status === status).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-9 w-64 bg-gray-200 rounded-xl animate-pulse mb-2" />
        <div className="h-5 w-48 bg-gray-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <Button onClick={loadBookings} variant="primary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card gradient className="p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-5">
            <Car className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            You haven't reserved any vehicles. Browse our fleet and book your first ride!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'} total
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
        {FILTER_OPTIONS.filter((f) => f === 'all' || countFor(f) > 0).map((f) => (
          <FilterTab
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            count={countFor(f)}
            active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400 font-medium">No {activeFilter} bookings found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id || booking.id}
              booking={booking}
              onCancelClick={handleCancelClick}
              cancellingId={cancellingId}
              onPayError={(msg) => setToast({ message: msg, type: 'error' })}
            />
          ))}
        </div>
      )}

      {showModalFor && (
        <CancelModal onConfirm={confirmCancel} onClose={closeModal} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}