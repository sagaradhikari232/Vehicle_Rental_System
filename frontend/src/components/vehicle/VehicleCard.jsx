// import { Star } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function VehicleCard({ vehicle }) {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate(`/vehicle/${vehicle.id}`, { state: { vehicle } });
//   };

//   return (
//     <article
//       onClick={handleClick}
//       className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
//     >
//       {/* Image */}
//       <div className="relative h-48 overflow-hidden">
//         <img
//           src={vehicle.image}
//           alt={vehicle.name}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

//         {/* Availability badge */}
//         <span
//           className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
//             vehicle.available
//               ? 'bg-emerald-500 text-white'
//               : 'bg-gray-400 text-white'
//           }`}
//         >
//           {vehicle.available ? 'Available' : 'Unavailable'}
//         </span>

//         {/* Category badge */}
//         <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
//           {vehicle.category}
//         </span>
//       </div>

//       {/* Content */}
//       <div className="p-4">
//         <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{vehicle.name}</h3>

//         {/* Rating */}
//         <div className="flex items-center gap-1 mb-3">
//           <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
//           <span className="text-sm font-semibold text-gray-700">{vehicle.rating}</span>
//           <span className="text-xs text-gray-400">({vehicle.reviewCount})</span>
//         </div>

//         {/* Specs row */}
//         <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
//           <span>{vehicle.seats} Seats</span>
//           <span className="w-px h-3 bg-gray-200" />
//           <span>{vehicle.transmission}</span>
//           <span className="w-px h-3 bg-gray-200" />
//           <span>{vehicle.fuelType}</span>
//         </div>

//         {/* Price */}
//         <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//           <div>
//             <p className="text-xs text-gray-400">per day</p>
//             <p className="text-lg font-bold text-orange-500">Rs. {vehicle.price.toLocaleString()}</p>
//           </div>
//           <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200">
//             View Details
//           </span>
//         </div>
//       </div>
//     </article>
//   );
// }