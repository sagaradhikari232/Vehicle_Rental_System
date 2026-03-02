import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Table from '../../admin/Table';
import StatusBadge from '../../admin/StatusBadge';

const Vehicles = () => {
  const [vehicles] = useState([
    { id: 1, name: 'Tesla Model Y', type: 'Electric', price: 89, status: 'Active', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=60&fit=crop' },
    { id: 2, name: 'BMW X5 M-Sport', type: 'Luxury SUV', price: 120, status: 'Active', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&h=60&fit=crop' },
    { id: 3, name: 'Ford Mustang GT', type: 'Muscle', price: 150, status: 'Banned', img: 'https://images.unsplash.com/photo-1584345604482-8504ae29ea7f?w=100&h=60&fit=crop' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search vehicles..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
          <Plus size={20} />
          <span>Add Vehicle</span>
        </button>
      </div>

      <Table headers={['Vehicle', 'Type', 'Price/Day', 'Status', 'Actions']}>
        {vehicles.map((car) => (
          <tr key={car.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={car.img} alt={car.name} className="w-16 h-10 object-cover rounded-lg bg-gray-100" />
                <span className="font-semibold text-gray-800">{car.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{car.type}</td>
            <td className="px-6 py-4 text-sm font-bold text-gray-900">${car.price}</td>
            <td className="px-6 py-4">
              <StatusBadge type={car.status} />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default Vehicles;