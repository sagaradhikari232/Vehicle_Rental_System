import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Filter,
} from 'lucide-react';
import api from '../../../utils/api';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed:     { label: 'Completed',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 },
  pending:       { label: 'Pending',       color: 'text-amber-700  bg-amber-50  border-amber-200',  dot: 'bg-amber-400',   Icon: Clock },
  initiated:     { label: 'Initiated',     color: 'text-blue-700   bg-blue-50   border-blue-200',   dot: 'bg-blue-400',    Icon: Clock },
  failed:        { label: 'Failed',        color: 'text-rose-700   bg-rose-50   border-rose-200',   dot: 'bg-rose-500',    Icon: XCircle },
  refunded:      { label: 'Refunded',      color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500',  Icon: RotateCcw },
  expired:       { label: 'Expired',       color: 'text-slate-600  bg-slate-100 border-slate-200',  dot: 'bg-slate-400',   Icon: AlertCircle },
  user_canceled: { label: 'Cancelled',     color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-400',  Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (date) =>
  date ? new Date(date).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtAmount = (n) =>
  `Rs. ${Number(n ?? 0).toLocaleString('en-NP')}`;

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, sub, color }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color ?? 'text-slate-900'}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Payments = () => {
  const [payments, setPayments]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [statusFilter, setStatus]   = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const LIMIT = 10;

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/payments', { params });
      setPayments(res.data.payments ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const completedCount = payments.filter((p) => p.status === 'completed').length;
  const pendingCount   = payments.filter((p) => ['pending', 'initiated'].includes(p.status)).length;
  const failedCount    = payments.filter((p) => ['failed', 'expired', 'user_canceled'].includes(p.status)).length;

  // ── Client-side search (on current page) ────────────────────────────────────
  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.pidx?.toLowerCase().includes(q) ||
      p.user?.fullname?.toLowerCase().includes(q) ||
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.user?.phone?.includes(q) ||
      p.booking?._id?.toLowerCase().includes(q) ||
      p.khalti_transaction_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] min-h-screen font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Khalti Transaction Ledger</p>
        </div>
        <button
          onClick={fetchPayments}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Revenue"  value={fmtAmount(totalRevenue)} color="text-emerald-600" sub="on this page" />
        <SummaryCard label="Total Records"  value={total} sub="across all pages" />
        <SummaryCard label="Completed"      value={completedCount} color="text-emerald-600" />
        <SummaryCard label="Pending / Failed" value={`${pendingCount} / ${failedCount}`} color="text-amber-600" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by PIDX, user email, booking ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="appearance-none pl-9 pr-8 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Transaction', 'Customer', 'Booking', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-slate-100 rounded-full animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? null : (
                filtered.map((payment) => (
                  <tr key={payment._id} className="group hover:bg-indigo-50/30 transition-all duration-200">

                    {/* Transaction */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 font-mono tracking-tight">
                            {payment.pidx ? `${payment.pidx.slice(0, 12)}…` : '—'}
                          </p>
                          {payment.khalti_transaction_id && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              TXN: {payment.khalti_transaction_id.slice(0, 10)}…
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {payment.user?.avatar ? (
                          <img
                            src={payment.user.avatar}
                            alt={payment.user.fullname}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                            {(payment.user?.fullname ?? payment.user?.name ?? '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {payment.user?.fullname ?? payment.user?.name ?? '—'}
                          </p>
                          <p className="text-xs text-slate-400">{payment.user?.email ?? '—'}</p>
                          {payment.user?.phone && (
                            <p className="text-[10px] text-slate-400">{payment.user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Booking */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold text-slate-600">
                          #{payment.booking?._id?.slice(-8) ?? '—'}
                        </p>
                        {/* Vehicle info */}
                        {payment.booking?.vehicle ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wide">Vehicle</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              #{typeof payment.booking.vehicle === 'object'
                                ? (payment.booking.vehicle.name ?? payment.booking.vehicle._id?.slice(-6))
                                : payment.booking.vehicle.slice(-6)}
                            </span>
                          </div>
                        ) : null}
                        {/* Dates */}
                        {payment.booking?.pickup_datetime && (
                          <p className="text-[10px] text-slate-400">
                            {fmt(payment.booking.pickup_datetime)} → {fmt(payment.booking.dropoff_datetime)}
                          </p>
                        )}
                        {/* Booking status */}
                        {payment.booking?.status && (
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${payment.booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                              payment.booking.status === 'pending'   ? 'bg-amber-50 text-amber-600' :
                              payment.booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                              'bg-slate-100 text-slate-500'}`}>
                            {payment.booking.status}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{fmtAmount(payment.amount)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge status={payment.status} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-600">{fmt(payment.createdAt)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-28 flex flex-col items-center gap-4">
            <div className="p-8 bg-slate-50 rounded-full text-slate-300">
              <Inbox size={56} strokeWidth={1} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">No payments found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
            {' '}· {total} total records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;