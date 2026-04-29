import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Heart, X, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';
import SpecsGrid from '../vehicle/SpecsGrid';
import SimilarVehicles from '../vehicle/SimilarVehicles';
import api from '../../utils/api'; 

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({ vehicle, onClose }) {
  const today = new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  const [form, setForm] = useState({
    pickup_datetime: '',
    dropoff_datetime: '',
    pickup_location: '',
    dropoff_location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // Compute total rent dynamically so the user sees it live
  const computeTotalDays = () => {
    if (!form.pickup_datetime || !form.dropoff_datetime) return null;
    const ms = new Date(form.dropoff_datetime) - new Date(form.pickup_datetime);
    if (ms <= 0) return null;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  const totalDays = computeTotalDays();
  const totalAmount = totalDays ? totalDays * vehicle.price : null;

  const handleSubmit = async () => {
    // ── Basic validation ──────────────────────────────────────
    if (!form.pickup_datetime || !form.dropoff_datetime) {
      return setError('Please select both pickup and dropoff date & time.');
    }
    if (new Date(form.dropoff_datetime) <= new Date(form.pickup_datetime)) {
      return setError('Dropoff must be after pickup.');
    }
    if (!form.pickup_location.trim()) {
      return setError('Pickup location is required.');
    }

    setLoading(true);
    setError('');

    try {
      // ── Step 1: Create booking ────────────────────────────
      const bookingRes = await api.post('/bookings', {
        vehicle: vehicle._id,
        pickup_datetime: form.pickup_datetime,
        dropoff_datetime: form.dropoff_datetime,
        pickup_location: form.pickup_location.trim(),
        dropoff_location: form.dropoff_location.trim() || form.pickup_location.trim(),
        total_rent_amount: totalAmount,
      });
      console.log("This is from bookingResonse:", bookingRes)
      const bookingId = bookingRes.data?.booking?._id ?? bookingRes.data?._id;

      if (!bookingId) throw new Error('Booking created but ID missing in response.');

      // ── Step 2: Initiate Khalti payment ───────────────────
      const paymentRes = await api.post(`/payments/initiate/${bookingId}`);

      const paymentUrl = paymentRes.data?.payment_url;

      if (!paymentUrl) throw new Error('Payment initiated but no payment_url returned.');

      // ── Step 3: Redirect to Khalti ────────────────────────
      window.location.href = paymentUrl;

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-8 py-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-orange-100 text-sm font-medium mb-1">Booking</p>
          <h2 className="text-2xl font-extrabold">{vehicle.name}</h2>
          <p className="text-orange-100 text-sm mt-1">Rs. {vehicle.price.toLocaleString()} / day</p>
        </div>

        {/* Form */}
        <div className="px-8 py-6 flex flex-col gap-5">

          {/* Pickup datetime */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              Pickup Date & Time
            </label>
            <input
              type="datetime-local"
              name="pickup_datetime"
              min={today}
              value={form.pickup_datetime}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Dropoff datetime */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              Dropoff Date & Time
            </label>
            <input
              type="datetime-local"
              name="dropoff_datetime"
              min={form.pickup_datetime || today}
              value={form.dropoff_datetime}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Pickup location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              Pickup Location
            </label>
            <input
              type="text"
              name="pickup_location"
              placeholder="e.g. Thamel, Kathmandu"
              value={form.pickup_location}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Dropoff location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              Dropoff Location
              <span className="text-gray-400 font-normal text-xs">(optional — defaults to pickup)</span>
            </label>
            <input
              type="text"
              name="dropoff_location"
              placeholder="e.g. Pokhara"
              value={form.dropoff_location}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Live price summary */}
          {totalDays && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">
                {totalDays} day{totalDays > 1 ? 's' : ''} × Rs. {vehicle.price.toLocaleString()}
              </p>
              <p className="text-lg font-black text-orange-600">
                Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-orange-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              'Confirm & Pay with Khalti'
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            You'll be redirected to Khalti's secure payment page.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── VehicleDetail ────────────────────────────────────────────────────────────

export default function VehicleDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [wishlisted, setWishlisted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const vehicle = state?.vehicle;

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Vehicle details not found.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          vehicle={vehicle}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* ── Floating Back Button ──────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-lg hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 group"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      </button>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 mb-8 shadow-xl">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                {vehicle.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
                {vehicle.name}
              </h1>
            </div>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                vehicle.status ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
              }`}
            >
              {vehicle.status ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {vehicle.status ? 'Available' : 'Unavailable'}
            </div>
          </div>
        </div>

        {/* ── Main Layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
              <div className="flex gap-2 flex-wrap">
                {vehicle.features.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-2 text-xs bg-orange-50 text-orange-700 border border-orange-100 px-4 py-2 rounded-xl font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                    <span className="uppercase tracking-tight">{f}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SpecsGrid vehicle={vehicle} />
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Vehicle</h2>
              <p className="text-gray-600 leading-relaxed text-base">{vehicle.description}</p>
            </div>
          </div>

          {/* Right Column: Booking Sidepanel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white">
                <p className="text-orange-100 text-sm font-medium mb-1">Daily Rental</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">Rs. {vehicle.price.toLocaleString()}</span>
                  <span className="text-orange-100 text-sm">/ day</span>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-5">
                {/* ── Book Now → opens modal ── */}
                <Button
                  size="lg"
                  //  disabled={vehicle.available}
                  className="w-full py-4 text-lg font-bold shadow-lg shadow-orange-200"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Now
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setWishlisted((w) => !w)}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      wishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-bold">{wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </Button>

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  {['Free cancellation', 'Verified & insured', '24/7 support'].map((point) => (
                    <p key={point} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}





// import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, CheckCircle2, XCircle, Heart } from 'lucide-react';
// import { useState } from 'react';
// import Button from '../common/Button';
// import SpecsGrid from '../vehicle/SpecsGrid';
// import SimilarVehicles from '../vehicle/SimilarVehicles';
// // import { getSimilarVehicles } from '../../data/vehicles';

// export default function VehicleDetail() {
//   const { state } = useLocation();
//   console.log("his is from state", state)
//   const { id } = useParams();
//   // console.log("This is id:", id)
//   const navigate = useNavigate();
//   const [wishlisted, setWishlisted] = useState(false);

//   // Get vehicle data from state or find by ID
//   //const vehicle = state?.vehicle ?? vehicles.find((v) => v.id === id);
//   const vehicle = state.vehicle

//   if (!vehicle) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
//         <p className="text-gray-600 text-lg font-medium">Vehicle details not found.</p>
//         <Button onClick={() => navigate('/')}>Go Home</Button>
//       </div>
//     );
//   }

//   //const similarVehicles = getSimilarVehicles(vehicle);

//   return (
//     <div className="min-h-screen bg-gray-50 relative">
//       {/* ── Floating Back Button ────────────────────────────── */}
//       <button
//         onClick={() => navigate(-1)}
//         className="fixed top-6 left-6 z-50 p-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-lg hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 group"
//         aria-label="Go back"
//       >
//         <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
//       </button>

//       <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
//         {/* ── Hero section ────────────────────────────────────── */}
//         <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 mb-8 shadow-xl">
//           <img
//             src={vehicle.image}
//             alt={vehicle.name}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

//           <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
//             <div>
//               <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
//                 {vehicle.category}
//               </span>
//               <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
//                 {vehicle.name}
//               </h1>
//             </div>

//             <div
//               className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
//                 vehicle.status ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
//               }`}
//             >
//               {vehicle.status ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
//               {vehicle.status ? 'Available' : 'Unavailable'}
//             </div>
//           </div>
//         </div>

//         {/* ── Main Layout ─────────────────────────────────────── */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Column */}
//           <div className="lg:col-span-2 flex flex-col gap-8">
            
//             {/* Features Section (Styled with BOLD text) */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//               <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
//               <div className="flex gap-2 flex-wrap">
//                 {vehicle.features.map((f) => (
//                   <span
//                     key={f}
//                     className="flex items-center gap-2 text-xs bg-orange-50 text-orange-700 border border-orange-100 px-4 py-2 rounded-xl font-bold"
//                   >
//                     <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
//                     <span className="uppercase tracking-tight">{f}</span>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Specifications Grid */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//               <SpecsGrid vehicle={vehicle} />
//             </div>

//             {/* About Section */}
//             <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">About This Vehicle</h2>
//               <p className="text-gray-600 leading-relaxed text-base">
//                 {vehicle.description}
//               </p>
//             </div>
//           </div>

//           {/* Right Column: Booking Sidepanel */}
//           <aside className="lg:col-span-1">
//             <div className="sticky top-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//               <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white">
//                 <p className="text-orange-100 text-sm font-medium mb-1">Daily Rental</p>
//                 <div className="flex items-baseline gap-1">
//                   <span className="text-4xl font-black">Rs. {vehicle.price.toLocaleString()}</span>
//                   <span className="text-orange-100 text-sm">/ day</span>
//                 </div>
//               </div>

//               <div className="p-8 flex flex-col gap-5">
//                 <Button
//                   size="lg"
//                   disabled={!vehicle.available}
//                   className="w-full py-4 text-lg font-bold shadow-lg shadow-orange-200"
//                 >
//                   Book Now
//                 </Button>

//                 <Button
//                   variant="secondary"
//                   size="lg"
//                   className="w-full flex items-center justify-center gap-2"
//                   onClick={() => setWishlisted((w) => !w)}
//                 >
//                   <Heart
//                     className={`w-5 h-5 transition-colors ${
//                       wishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
//                     }`}
//                   />
//                   <span className="font-bold">{wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
//                 </Button>

//                 <div className="pt-6 border-t border-gray-100 space-y-3">
//                   {['Free cancellation', 'Verified & insured', '24/7 support'].map((point) => (
//                     <p key={point} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
//                       <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
//                       {point}
//                     </p>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </aside>
//         </div>

//         {/* Similar Vehicles */}
//         {/* <div className="mt-16">
//           <SimilarVehicles vehicles={similarVehicles} />
//         </div> */}
//       </main>
//     </div>
//   );
// }