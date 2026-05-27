import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Car,
  CreditCard,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import Table from '../../admin/Table';
import StatusBadge from '../../admin/StatusBadge';
import api from '../../../utils/api'; // ← your axios instance

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const toArray = (data, ...keys) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
};

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());

const fmtCurrency = (n) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0,
      }).format(n);

const fmtDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return str;
  }
};

// ─────────────────────────────────────────────
// useFetch — reusable fetch hook using your api instance
// ─────────────────────────────────────────────
const useFetch = (url) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(url)
      .then((res) => {
        if (!cancelled) setData(res.data?.data ?? res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? err.message ?? 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url, tick]);

  return { data, loading, error, refetch };
};

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, loading, error, onRetry, sub }) => (
  <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="space-y-3 flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
          {title}
        </p>

        {loading ? (
          <div className="flex items-center gap-2 h-9">
            <Loader2 size={20} className="animate-spin text-amber-400" />
            <span className="text-sm text-slate-400">Loading…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 h-9">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span className="text-xs text-rose-500 font-semibold truncate">{error}</span>
            {onRetry && (
              <button onClick={onRetry} className="ml-auto flex-shrink-0 hover:opacity-70">
                <RefreshCw size={13} className="text-rose-400" />
              </button>
            )}
          </div>
        ) : (
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
        )}

        {sub && !loading && !error && (
          <p className="text-xs text-slate-400 font-medium">{sub}</p>
        )}
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 flex-shrink-0 ml-4">
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-slate-50 dark:border-slate-800">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-8 py-5">
        <div
          className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
          style={{ width: `${55 + (i * 17) % 35}%` }}
        />
      </td>
    ))}
  </tr>
);

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
const Dashboard = () => {
  // Each resource fetches independently using your api.js instance
  const vehicles = useFetch('/vehicles/get-allvehicles');
  const bookings = useFetch('/bookings/');
  const users    = useFetch('/users/all');
  const payments = useFetch('/payments/');

  // ── Normalize to arrays ────────────────────
  const vehicleList = useMemo(() => toArray(vehicles.data, 'vehicles'), [vehicles.data]);
  const bookingList = useMemo(() => toArray(bookings.data, 'bookings'), [bookings.data]);
  const userList    = useMemo(() => toArray(users.data,    'users'),    [users.data]);
  const paymentList = useMemo(() => toArray(payments.data, 'payments'), [payments.data]);

  // ── Derived KPI values ─────────────────────
  const activeBookings = useMemo(
    () => bookingList.filter((b) => ['confirmed', 'active'].includes(b.status?.toLowerCase())).length,
    [bookingList]
  );
  const pendingCount = useMemo(
    () => bookingList.filter((b) => b.status?.toLowerCase() === 'pending').length,
    [bookingList]
  );
  const totalRevenue = useMemo(
    () => paymentList.filter((p) => p.status === 'completed').reduce((sum, p) => sum + (p.amount ?? 0), 0),
    [paymentList]
  );
  const availableVehicles = useMemo(
    () => vehicleList.filter((v) => v.isAvailable !== false).length,
    [vehicleList]
  );
  const activeUsers = useMemo(
    () => userList.filter((u) => u.isActive !== false).length,
    [userList]
  );

  // ── 5 most recent bookings ─────────────────
  const recentBookings = useMemo(
    () => [...bookingList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [bookingList]
  );

  const stats = [
    {
      title: 'Total Vehicles',
      value: fmt(vehicleList.length),
      icon: Car,
      loading: vehicles.loading,
      error: vehicles.error,
      onRetry: vehicles.refetch,
      sub: `${availableVehicles} available`,
    },
    {
      title: 'Active Bookings',
      value: fmt(activeBookings),
      icon: TrendingUp,
      loading: bookings.loading,
      error: bookings.error,
      onRetry: bookings.refetch,
      sub: `${pendingCount} pending approval`,
    },
    {
      title: 'Total Users',
      value: fmt(userList.length),
      icon: Users,
      loading: users.loading,
      error: users.error,
      onRetry: users.refetch,
      sub: `${activeUsers} active`,
    },
    {
      title: 'Total Revenue',
      value: fmtCurrency(totalRevenue),
      icon: CreditCard,
      loading: payments.loading,
      error: payments.error,
      onRetry: payments.refetch,
      sub: `${paymentList.filter((p) => p.status === 'completed').length} completed payments`,
    },
  ];

  // ─────────────────────────────────────────────
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6">

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <KPICard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Recent Bookings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {bookings.loading
                ? 'Fetching reservations…'
                : bookings.error
                ? 'Could not load bookings'
                : `Showing ${recentBookings.length} of ${bookingList.length} reservations`}
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-1.5 text-amber-600 text-sm font-bold hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            View All <ExternalLink size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table headers={['Booking ID', 'User', 'Vehicle', 'Date', 'Amount', 'Status', '']}>

            {/* Loading skeletons */}
            {bookings.loading &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

            {/* Error state */}
            {!bookings.loading && bookings.error && (
              <tr>
                <td colSpan={7} className="px-8 py-10 text-center">
                  <div className="flex flex-col items-center gap-3 text-rose-500">
                    <AlertCircle size={28} />
                    <p className="text-sm font-semibold">{bookings.error}</p>
                    <button
                      onClick={bookings.refetch}
                      className="flex items-center gap-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!bookings.loading && !bookings.error && recentBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center text-sm text-slate-400 font-medium">
                  No bookings found.
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!bookings.loading &&
              !bookings.error &&
              recentBookings.map((booking) => {
                const userField    = booking.userId   ?? booking.user;
                const vehicleField = booking.vehicleId ?? booking.vehicle;
                const userName     = userField?.fullname  ?? userField?.name    ?? 'Unknown User';
                const vehicleName  = vehicleField?.name   ?? vehicleField?.model ?? vehicleField?.title ?? 'Unknown Vehicle';
                const bookingRef   = booking._id ?? '—';
                const amount       = booking.total_rent_amount;
                const status       = booking.status ?? 'pending';

                return (
                  <tr
                    key={booking._id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-200 border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-amber-600 font-mono tracking-wide">
                      #{bookingRef}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {vehicleName}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600">
                      {fmtDate(booking.createdAt ?? booking.startDate)}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fmtCurrency(amount)}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge type={status} />
                    </td>
                  </tr>
                );
              })}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;