import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  User,
  Car,
  ArrowRight,
  TrendingUp,
  Inbox,
  Hash,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Flag
} from 'lucide-react';
import api from '../../../utils/api'; // adjust path if needed

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bookings');
      // Response shape: { bookings: [...] }
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load bookings.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // user and vehicle are already populated objects in the response
  const filteredBookings = bookings.filter((b) => {
    const userName    = b.user?.fullname ?? '';
    const vehicleName = b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '';
    const q = searchTerm.toLowerCase();
    return userName.toLowerCase().includes(q) || vehicleName.toLowerCase().includes(q);
  });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 size={40} className="animate-spin text-indigo-500" />
          <p className="text-sm font-semibold tracking-wide">Loading bookings…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="p-4 bg-red-50 rounded-full text-red-400">
            <AlertTriangle size={36} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Something went wrong</h3>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] min-h-screen font-sans selection:bg-indigo-100">

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">

        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm font-medium">Rental Intelligence Dashboard</p>
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Total card */}
        <div className="justify-self-end">
          <div className="bg-white border border-slate-100 rounded-[1.5rem] px-6 py-4 shadow-xl shadow-slate-200/40 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bookings</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{bookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Locations</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id ?? booking.id}
                  className="group hover:bg-indigo-50/30 transition-all duration-300"
                >
                  {/* Customer */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {booking.user?.avatar ? (
                        <img
                          src={booking.user.avatar}
                          alt={booking.user.fullname}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:scale-105 transition-transform">
                          <User size={20} strokeWidth={2.5} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {booking.user?.fullname ?? 'Unknown User'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {booking.user?.phone ?? '—'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {booking.vehicle?.image_url ? (
                        <img
                          src={booking.vehicle.image_url}
                          alt={booking.vehicle.model}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Car size={16} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">
                          {booking.vehicle
                            ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                            : 'Unknown Vehicle'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {booking.vehicle?.registration_number ?? '—'}
                        </span>
                        {booking.vehicle?.type && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-400 mt-0.5">
                            {booking.vehicle.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Timeline */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-0">
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-l-xl">
                        <Calendar size={12} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          {formatDate(booking.pickup_datetime)}
                        </span>
                      </div>
                      <div className="px-3 bg-slate-100 border-y border-slate-200 flex items-center">
                        <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-r-xl">
                        <span className="text-xs font-bold text-rose-900">
                          {formatDate(booking.dropoff_datetime)}
                        </span>
                        <Calendar size={12} className="text-rose-600" />
                      </div>
                    </div>
                  </td>

                  {/* Locations */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5 text-xs max-w-[200px]">
                      <span className="flex items-start gap-1.5 font-semibold text-slate-700 truncate" title={booking.pickup_location}>
                        <MapPin size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                        {booking.pickup_location ?? '—'}
                      </span>
                      <span className="flex items-start gap-1.5 text-slate-400 truncate" title={booking.dropoff_location}>
                        <Flag size={11} className="text-rose-400 mt-0.5 shrink-0" />
                        {booking.dropoff_location ?? '—'}
                      </span>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-black text-slate-900 text-base tracking-tight">
                        Rs. {(booking.total_rent_amount ?? booking.grand_total ?? 0).toLocaleString()}
                      </span>
                      {booking.security_deposit > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          + Rs. {booking.security_deposit.toLocaleString()} deposit
                        </span>
                      )}
                      {/* <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                        booking.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : booking.payment_status === 'pending'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {booking.payment_status}
                      </div> */}
                      <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                        booking.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredBookings.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="p-8 bg-slate-50 rounded-full text-slate-300">
              <Inbox size={64} strokeWidth={1} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">No matching bookings</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs px-4">
                We couldn't find anything matching your search. Try a different name or vehicle.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;