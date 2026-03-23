import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  CreditCard, 
  ArrowUpRight, 
  MoreHorizontal,
  ExternalLink 
} from 'lucide-react';

import Table from '../../admin/Table';
import StatusBadge from '../../admin/StatusBadge';

const KPICard = ({ title, value, change, icon: Icon, isPositive }) => (
  <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {isPositive ? '+' : ''}{change}
          </span>
          <span className="text-xs text-slate-400 font-medium">vs last month</span>
        </div>
      </div>
      
      <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Mock Data - In production, this would come from a custom hook or Redux/React Query
  const stats = [
    { title: "Total Vehicles", value: "142", change: "12%", icon: Car, isPositive: true },
    { title: "Active Bookings", value: "38", change: "5.4%", icon: TrendingUp, isPositive: true },
    { title: "Total Users", value: "2,840", change: "18%", icon: Users, isPositive: true },
    { title: "Revenue", value: "$42,500", change: "14.2%", icon: CreditCard, isPositive: true },
  ];

  const recentBookings = [
    { id: 'BK-9021', user: 'Sarah Connor', vehicle: 'Tesla Model 3', date: 'Oct 24, 2025', price: '$450.00', status: 'Confirmed' },
    { id: 'BK-9022', user: 'James Bond', vehicle: 'Aston Martin DB11', date: 'Oct 25, 2025', price: '$1,200.00', status: 'Pending' },
    { id: 'BK-9023', user: 'Ellen Ripley', vehicle: 'Range Rover Sport', date: 'Oct 26, 2025', price: '$380.00', status: 'Completed' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <KPICard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Activity Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Bookings</h2>
            <p className="text-xs text-slate-400 mt-0.5">Showing the latest reservations</p>
          </div>
          <button className="flex items-center gap-1.5 text-amber-600 text-sm font-bold hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50">
            View All <ExternalLink size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table headers={['Booking ID', 'User', 'Vehicle', 'Date', 'Price', 'Status', '']}>
            {recentBookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="group hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-50 last:border-0"
              >
                <td className="px-8 py-5 text-sm font-bold text-amber-600">
                  {booking.id}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                      {booking.user.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{booking.user}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                  {booking.vehicle}
                </td>
                <td className="px-8 py-5 text-sm text-slate-400">
                  {booking.date}
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-900">
                  {booking.price}
                </td>
                <td className="px-8 py-5">
                  <StatusBadge type={booking.status} />
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;