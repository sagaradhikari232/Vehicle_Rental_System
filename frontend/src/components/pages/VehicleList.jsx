// import { useState } from 'react';
// import { Search, SlidersHorizontal, Car } from 'lucide-react';
// import VehicleCard from '../sections/VehicleCard';
// import { vehicles } from '../data/vehicles';

// const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback'];

// export default function VehicleList() {
//   const [search, setSearch] = useState('');
//   const [activeCategory, setActiveCategory] = useState('All');

//   const filtered = vehicles.filter((v) => {
//     const matchesSearch =
//       v.name.toLowerCase().includes(search.toLowerCase()) ||
//       v.category.toLowerCase().includes(search.toLowerCase());
//     const matchesCategory =
//       activeCategory === 'All' || v.category === activeCategory;
//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero header */}
//       <header className="bg-white border-b border-gray-100 shadow-sm">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
//               <Car className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-bold text-gray-900">DriveEase</span>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Available Vehicles</h1>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found
//               </p>
//             </div>

//             {/* Search */}
//             <div className="relative w-full sm:w-72">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search vehicles..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
//               />
//             </div>
//           </div>

//           {/* Category filter pills */}
//           <div className="flex items-center gap-2 mt-5 flex-wrap">
//             <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-1" />
//             {CATEGORIES.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setActiveCategory(cat)}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
//                   activeCategory === cat
//                     ? 'bg-orange-500 text-white shadow-sm'
//                     : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>
//       </header>

//       {/* Grid */}
//       <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
//         {filtered.length === 0 ? (
//           <div className="text-center py-24">
//             <p className="text-gray-400 text-lg">No vehicles match your search.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//             {filtered.map((vehicle) => (
//               <VehicleCard key={vehicle.id} vehicle={vehicle} />
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }