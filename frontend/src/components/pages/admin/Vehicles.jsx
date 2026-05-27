import { useState, useReducer, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Edit3, Trash2, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Car, Fuel, Users, CheckCircle,
  AlertTriangle, Clock, Image as ImageIcon,
} from "lucide-react";
import api from "../../../utils/api"; // axios instance pointing to localhost:8000/api/v1

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  available:   { label: "Available",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle },
  booked:      { label: "Booked",      color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",   Icon: Clock },
  maintenance: { label: "Maintenance", color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500",     Icon: AlertTriangle },
};

const FUEL_OPTIONS   = ["petrol", "diesel", "electric"];
const TYPE_OPTIONS   = ["car", "bike", "scooter", "suv", "jeep", "ev"];
const STATUS_OPTIONS = ["available", "booked", "maintenance"];

const EMPTY_FORM = {
  brand: "", model: "", registration_number: "", type: "car",
  fuel_type: "petrol", seats: "", daily_rate: "", hourly_rate: "",
  status: "available", location: "Lumbini Branch",
  mileage: "", battery_range: "",
  image_file: null,
};

// ─── REDUCER ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":    return { ...state, loading: action.payload };
    case "SET_VEHICLES":   return { ...state, vehicles: action.payload, loading: false };
    case "ADD_VEHICLE":    return { ...state, vehicles: [action.payload, ...state.vehicles] };
    case "UPDATE_VEHICLE": return { ...state, vehicles: state.vehicles.map(v => v._id === action.payload._id ? action.payload : v) };
    case "DELETE_VEHICLE": return { ...state, vehicles: state.vehicles.filter(v => v._id !== action.payload) };
    case "SET_SEARCH":     return { ...state, search: action.payload, page: 1 };
    case "SET_FILTER":     return { ...state, filters: { ...state.filters, ...action.payload }, page: 1 };
    case "SET_SORT":       return { ...state, sort: action.payload };
    case "SET_PAGE":       return { ...state, page: action.payload };
    case "ADD_TOAST":      return { ...state, toasts: [...state.toasts, action.payload] };
    case "REMOVE_TOAST":   return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default: return state;
  }
}

const initialState = {
  vehicles: [], loading: true, search: "",
  filters: { status: "all", fuel_type: "all" },
  sort: { key: "brand", dir: "asc" },
  page: 1, toasts: [],
};

const PAGE_SIZE = 8;

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────────
const Field = ({ label, error, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-xl border text-sm bg-slate-50 text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-amber-300 ${err ? "border-red-300 bg-red-50" : "border-slate-200"}`;

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);
  const colors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-amber-500" };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${colors[toast.type] || colors.info} animate-slide-in`}>
      <span>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[140, 100, 80, 80, 70].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

function DeleteModal({ vehicle, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Remove vehicle?</h3>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-semibold text-slate-700">{vehicle.brand} {vehicle.model}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60">
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VEHICLE FORM MODAL ─────────────────────────────────────────────────────────
function VehicleFormModal({ vehicle, onClose, onSubmit, loading }) {
  const isEdit = Boolean(vehicle?._id);
  const [form, setForm] = useState(vehicle
    ? {
        brand: vehicle.brand,
        model: vehicle.model,
        registration_number: vehicle.registration_number,
        type: vehicle.type,
        fuel_type: vehicle.fuel_type,
        seats: vehicle.seats,
        daily_rate: vehicle.daily_rate,
        hourly_rate: vehicle.hourly_rate || "",
        status: vehicle.status,
        location: vehicle.location || "Lumbini Branch",
        mileage: vehicle.mileage || "",
        battery_range: vehicle.battery_range || "",
        image_file: null,
      }
    : { ...EMPTY_FORM }
  );
  const [previewUrl, setPreviewUrl] = useState(vehicle?.image_url || "");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image_file: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.model.trim()) e.model = "Model is required";
    if (!form.registration_number.trim()) e.registration_number = "Required";
    if (!form.seats || form.seats < 1 || form.seats > 8) e.seats = "Must be 1–8";
    if (!form.daily_rate || form.daily_rate < 1 || form.daily_rate > 20000) e.daily_rate = "Must be 1–20000";
    if (!isEdit && !form.image_file) e.image_file = "Vehicle photo is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build FormData — backend uses multer for image_url field
    const data = new FormData();
    data.append("brand", form.brand.trim());
    data.append("model", form.model.trim());
    data.append("registration_number", form.registration_number.trim());
    data.append("type", form.type);
    data.append("fuel_type", form.fuel_type);
    data.append("seats", Number(form.seats));
    data.append("daily_rate", Number(form.daily_rate));
    if (form.hourly_rate)    data.append("hourly_rate",    Number(form.hourly_rate));
    if (form.mileage)        data.append("mileage",        Number(form.mileage));
    if (form.battery_range)  data.append("battery_range",  Number(form.battery_range));
    data.append("status", form.status);
    data.append("location", form.location);
    if (form.image_file) data.append("image_url", form.image_file); // multer field name is "image_url"

    onSubmit(data, vehicle?._id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? "Edit vehicle" : "Add new vehicle"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        {/* Image upload */}
        <div className="px-6 pt-5">
          <label className="group cursor-pointer block">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className={`w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center overflow-hidden group-hover:border-amber-300 group-hover:bg-amber-50/30 transition-all ${errors.image_file ? "border-red-300" : "border-slate-200"}`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-2 group-hover:text-amber-500 group-hover:scale-110 transition-all">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-600">
                    {isEdit ? "Click to change photo" : "Click to upload vehicle photo *"}
                  </span>
                </>
              )}
            </div>
            {errors.image_file && <p className="text-xs text-red-500 mt-1">{errors.image_file}</p>}
          </label>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-2 gap-4">
          <Field label="Brand" error={errors.brand}>
            <input name="brand" className={inputCls(errors.brand)} value={form.brand} onChange={handleChange} placeholder="Toyota" />
          </Field>
          <Field label="Model" error={errors.model}>
            <input name="model" className={inputCls(errors.model)} value={form.model} onChange={handleChange} placeholder="Hiace" />
          </Field>
          <Field label="Registration no." error={errors.registration_number}>
            <input name="registration_number" className={inputCls(errors.registration_number)} value={form.registration_number} onChange={handleChange} placeholder="BA 1 JA 2341" />
          </Field>
          <Field label="Location">
            <input name="location" className={inputCls()} value={form.location} onChange={handleChange} placeholder="Lumbini Branch" />
          </Field>
          <Field label="Type">
            <select name="type" className={inputCls()} value={form.type} onChange={handleChange}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </Field>
          <Field label="Fuel">
            <select name="fuel_type" className={inputCls()} value={form.fuel_type} onChange={handleChange}>
              {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" className={inputCls()} value={form.status} onChange={handleChange}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
            </select>
          </Field>
          <Field label="Seats" error={errors.seats}>
            <input name="seats" type="number" min="1" max="8" className={inputCls(errors.seats)} value={form.seats} onChange={handleChange} />
          </Field>
          <Field label="Daily rate (Rs.)" error={errors.daily_rate}>
            <input name="daily_rate" type="number" className={inputCls(errors.daily_rate)} value={form.daily_rate} onChange={handleChange} />
          </Field>
          <Field label="Hourly rate (Rs.) — optional">
            <input name="hourly_rate" type="number" className={inputCls()} value={form.hourly_rate} onChange={handleChange} />
          </Field>
          <Field label="Mileage (km) — optional">
            <input name="mileage" type="number" min="0" className={inputCls()} value={form.mileage} onChange={handleChange} placeholder="e.g. 45000" />
          </Field>
          <Field label="Battery range (km) — optional">
            <input name="battery_range" type="number" min="0" className={inputCls()} value={form.battery_range} onChange={handleChange} placeholder="e.g. 300" />
          </Field>

          <div className="col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-900 text-sm font-bold disabled:opacity-60 transition-all active:scale-[0.98]">
              {loading ? "Saving…" : isEdit ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── TABLE COMPONENTS ───────────────────────────────────────────────────────────
function SortTh({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <th className="px-5 py-3 text-left">
      <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-800 transition-colors">
        {label}
        <span className={`transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
          {active && sort.dir === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </span>
      </button>
    </th>
  );
}

function VehicleRow({ vehicle, onEdit, onDelete }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-amber-50/40 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
            {vehicle.image_url
              ? <img src={vehicle.image_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Car size={16} className="text-slate-300" /></div>}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</div>
            <div className="text-[10px] font-mono text-slate-400">{vehicle.registration_number}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Fuel size={10} />{vehicle.fuel_type}</span>
          <span className="flex items-center gap-1"><Users size={10} />{vehicle.seats}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm font-bold text-slate-900">Rs. {Number(vehicle.daily_rate).toLocaleString()}</span>
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={vehicle.status} /></td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => onEdit(vehicle)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Edit3 size={14} /></button>
          <button onClick={() => onDelete(vehicle)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function VehicleTable({ vehicles, sort, onSort, onEdit, onDelete, loading }) {
  if (!loading && vehicles.length === 0)
    return <div className="py-20 text-center text-slate-400 text-sm">No vehicles found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <SortTh label="Vehicle" sortKey="brand" sort={sort} onSort={onSort} />
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Specs</th>
            <SortTh label="Rate" sortKey="daily_rate" sort={sort} onSort={onSort} />
            <SortTh label="Status" sortKey="status" sort={sort} onSort={onSort} />
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : vehicles.map(v => <VehicleRow key={v._id} vehicle={v} onEdit={onEdit} onDelete={onDelete} />)}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, Icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}><Icon size={18} /></div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Vehicles() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modal, setModal]   = useState(null);
  const [saving, setSaving] = useState(false);
  const toastId = useRef(0);

  const toast = useCallback((message, type = "success") => {
    const id = ++toastId.current;
    dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
  }, []);

  // ── Fetch all vehicles on mount ──
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    api.get("/vehicles/get-allvehicles")
      .then(res => {
        const vehicles = res.data?.data?.vehicles || [];
        dispatch({ type: "SET_VEHICLES", payload: vehicles });
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Failed to load vehicles";
        // 404 just means empty fleet — not a real error
        if (err.response?.status === 404) {
          dispatch({ type: "SET_VEHICLES", payload: [] });
        } else {
          toast(msg, "error");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      });
  }, [toast]);

  const { vehicles, search, filters, sort, page, loading, toasts } = state;

  // ── Client-side filter + sort (on already-fetched data) ──
  const filtered = vehicles
    .filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${v.brand} ${v.model} ${v.registration_number}`.toLowerCase().includes(q);
      const matchStatus = filters.status === "all" || v.status === filters.status;
      const matchFuel   = filters.fuel_type === "all" || v.fuel_type === filters.fuel_type;
      return matchSearch && matchStatus && matchFuel;
    })
    .sort((a, b) => {
      const val = v => typeof v[sort.key] === "string" ? v[sort.key].toLowerCase() : v[sort.key];
      const d = sort.dir === "asc" ? 1 : -1;
      return val(a) < val(b) ? -d : val(a) > val(b) ? d : 0;
    });

  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = {
    total:     vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    booked:    vehicles.filter(v => v.status === "booked" || v.status === "rented").length,
    maint:     vehicles.filter(v => v.status === "maintenance").length,
  };

  // ── Add vehicle ──
  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const res = await api.post("/vehicles/register-vehicle", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({ type: "ADD_VEHICLE", payload: res.data.data });
      toast("Vehicle added successfully");
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error adding vehicle";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit vehicle ──
  const handleEdit = async (formData, vehicleId) => {
    setSaving(true);
    try {
      const res = await api.patch(`/vehicles/update-vehicledetail/${vehicleId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({ type: "UPDATE_VEHICLE", payload: res.data.data });
      toast("Vehicle updated");
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error updating vehicle";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete vehicle ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/vehicles/delete-vehicle/${modal.vehicle._id}`);
      dispatch({ type: "DELETE_VEHICLE", payload: modal.vehicle._id });
      toast("Vehicle removed");
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error removing vehicle";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: none; opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.25s ease; }
        .animate-scale-in { animation: scaleIn 0.2s ease; }
      `}</style>

      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Fleet Management</h1>
              <p className="text-sm text-slate-500">Overview of your rental assets</p>
            </div>
            <button
              onClick={() => setModal({ type: "add" })}
              className="bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Add Vehicle
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Fleet Size"  value={stats.total}     Icon={Car}           accent="bg-slate-100 text-slate-600" />
            <StatCard label="Available"   value={stats.available} Icon={CheckCircle}   accent="bg-emerald-50 text-emerald-600" />
            <StatCard label="Booked"      value={stats.booked}    Icon={Clock}         accent="bg-amber-50 text-amber-600" />
            <StatCard label="Service"     value={stats.maint}     Icon={AlertTriangle} accent="bg-red-50 text-red-500" />
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Search by brand, model, reg. no…"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                />
              </div>
              <select
                value={filters.status}
                onChange={e => dispatch({ type: "SET_FILTER", payload: { status: e.target.value } })}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
              </select>
              <select
                value={filters.fuel_type}
                onChange={e => dispatch({ type: "SET_FILTER", payload: { fuel_type: e.target.value } })}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none"
              >
                <option value="all">All Fuel</option>
                {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
              </select>
            </div>

            <VehicleTable
              vehicles={paginated}
              sort={sort}
              onSort={(key) => dispatch({ type: "SET_SORT", payload: { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" } })}
              onEdit={v => setModal({ type: "edit", vehicle: v })}
              onDelete={v => setModal({ type: "delete", vehicle: v })}
              loading={loading}
            />

            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Page {page} of {totalPages} · {filtered.length} vehicles
                </span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => dispatch({ type: "SET_PAGE", payload: page - 1 })} className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <button disabled={page === totalPages} onClick={() => dispatch({ type: "SET_PAGE", payload: page + 1 })} className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "add"    && <VehicleFormModal onClose={() => setModal(null)} onSubmit={handleAdd} loading={saving} />}
      {modal?.type === "edit"   && <VehicleFormModal vehicle={modal.vehicle} onClose={() => setModal(null)} onSubmit={handleEdit} loading={saving} />}
      {modal?.type === "delete" && <DeleteModal vehicle={modal.vehicle} onConfirm={handleDelete} onCancel={() => setModal(null)} loading={saving} />}

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={id => dispatch({ type: "REMOVE_TOAST", payload: id })} />)}
      </div>
    </>
  );
}