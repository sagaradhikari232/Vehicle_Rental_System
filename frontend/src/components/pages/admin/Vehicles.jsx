import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Car, 
  ChevronDown 
} from 'lucide-react';

import Table from '../../admin/Table';
import StatusBadge from '../../admin/StatusBadge';

const Vehicles = () => {
  // In a real app, this state would likely be managed by a fetching library like React Query
  const [vehicles] = useState([
    { id: 'V-101', name: 'Tesla Model Y', type: 'Electric', price: 89, status: 'Active', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=60&fit=crop' },
    { id: 'V-102', name: 'BMW X5 M-Sport', type: 'Luxury SUV', price: 120, status: 'Active', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&h=60&fit=crop' },
    { id: 'V-103', name: 'Ford Mustang GT', type: 'Muscle', price: 150, status: 'Banned', img: 'https://images.unsplash.com/photo-1584345604482-8504ae29ea7f?w=100&h=60&fit=crop' },
  ]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, model, or ID..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Filter size={18} className="text-slate-400" />
            <span>Filters</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>

        <button className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-2.5 rounded-xl font-bold shadow-sm shadow-amber-200 transition-all active:scale-[0.98]">
          <Plus size={20} strokeWidth={2.5} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Main Data Table */}
      <Table headers={['Vehicle Details', 'Category', 'Daily Rate', 'Status', 'Actions']}>
        {vehicles.map((car) => (
          <tr 
            key={car.id} 
            className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
          >
            {/* Vehicle Info Column */}
            <td className="px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={car.img} 
                    alt={car.name} 
                    className="w-20 h-12 object-cover rounded-lg ring-1 ring-slate-200" 
                  />
                  <div className="absolute -top-2 -left-2 bg-white p-1 rounded-full shadow-sm border border-slate-100 lg:hidden">
                    <Car size={12} className="text-amber-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {car.name}
                  </span>
                  <span className="text-xs font-medium text-slate-400 tracking-wider">
                    ID: {car.id}
                  </span>
                </div>
              </div>
            </td>

            {/* Type Column */}
            <td className="px-8 py-5">
              <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {car.type}
              </span>
            </td>

            {/* Price Column */}
            <td className="px-8 py-5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900 tabular-nums">${car.price}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ day</span>
              </div>
            </td>

            {/* Status Column */}
            <td className="px-8 py-5">
              <StatusBadge type={car.status} />
            </td>

            {/* Actions Column */}
            <td className="px-8 py-5">
              <div className="flex items-center justify-end gap-1">
                <button 
                  title="Edit Vehicle"
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  title="Delete Vehicle"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Pagination Footer (Optional but recommended for production) */}
      <div className="flex items-center justify-between px-2 text-sm text-slate-500 font-medium">
        <p>Showing 3 of 42 vehicles</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;