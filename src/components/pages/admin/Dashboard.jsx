import React from 'react';
import { TrendingUp, Users, Car, CreditCard } from 'lucide-react';
import Table from '../../admin/Table';
import StatusBadge from '../../admin/StatusBadge';

const KPICard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} <span className="text-gray-400 ml-1 font-normal">vs last month</span>
        </p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const recentBookings = [
    { id: 'BK-9021', user: 'Sarah Connor', vehicle: 'Tesla Model 3', date: 'Oct 24, 2025', price: '$450.00', status: 'Confirmed' },
    { id: 'BK-9022', user: 'James Bond', vehicle: 'Aston Martin DB11', date: 'Oct 25, 2025', price: '$1,200.00', status: 'Pending' },
    { id: 'BK-9023', user: 'Ellen Ripley', vehicle: 'Range Rover Sport', date: 'Oct 26, 2025', price: '$380.00', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Vehicles" value="142" change="+12%" icon={Car} color="bg-blue-500" />
        <KPICard title="Active Bookings" value="38" change="+5.4%" icon={TrendingUp} color="bg-indigo-500" />
        <KPICard title="Total Users" value="2,840" change="+18%" icon={Users} color="bg-violet-500" />
        <KPICard title="Revenue" value="$42,500" change="+14.2%" icon={CreditCard} color="bg-emerald-500" />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <Table headers={['Booking ID', 'User', 'Vehicle', 'Date', 'Price', 'Status']}>
          {recentBookings.map((booking) => (
            <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-blue-600">{booking.id}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{booking.user}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{booking.vehicle}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{booking.date}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{booking.price}</td>
              <td className="px-6 py-4">
                <StatusBadge type={booking.status} />
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;