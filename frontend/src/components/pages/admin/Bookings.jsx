import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  Car, 
  ArrowRight,
  TrendingUp,
  Inbox,
  Hash
} from 'lucide-react';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [bookings] = useState([
    {
      id: 'BK-9921',
      customer: { name: 'Suman Hamal', phone: '9841XXXXXX', email: 'suman@mail.com' },
      vehicle: { name: 'Tesla Model Y', reg: 'BA-PA-1234' },
      duration: { start: 'Oct 25, 2023', end: 'Oct 27, 2023' },
      totalPrice: 17000,
      payment: 'Paid'
    },
    {
      id: 'BK-9922',
      customer: { name: 'Rita Thapa', phone: '9801XXXXXX', email: 'rita@mail.com' },
      vehicle: { name: 'Yamaha MT-15', reg: 'LU-64-PA' },
      duration: { start: 'Oct 26, 2023', end: 'Oct 26, 2023' },
      totalPrice: 1500,
      payment: 'Pending'
    }
  ]);

  const filteredBookings = bookings.filter(b => 
    b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] min-h-screen font-sans selection:bg-indigo-100">
      
      {/* Header & Centered Search Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
        {/* Left: Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm font-medium">Rental Intelligence Dashboard</p>
        </div>

        {/* Center: Search Bar (Enhanced Visibility) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
          <div className="relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors" 
              size={20} 
            />
            <input 
              type="text" 
              placeholder="Search by name or vehicle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Changed text-slate-900 and font-bold for high visibility
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right: Total Card */}
        <div className="justify-self-end">
          <div className="bg-white border border-slate-100 rounded-[1.5rem] px-6 py-4 shadow-xl shadow-slate-200/40 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bookings</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{bookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="group hover:bg-indigo-50/30 transition-all duration-300"
                >
                  {/* Customer Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:scale-105 transition-transform">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{booking.customer.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Hash size={10} /> {booking.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Car size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{booking.vehicle.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {booking.vehicle.reg}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Enhanced Timeline Column (Improved Dates & Connector) */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-0">
                      {/* Start Date Pill */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-l-xl">
                        <Calendar size={12} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">{booking.duration.start}</span>
                      </div>
                      
                      {/* Visual Connector */}
                      <div className="px-3 bg-slate-100 border-y border-slate-200 flex items-center">
                        <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* End Date Pill */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-r-xl">
                        <span className="text-xs font-bold text-rose-900">{booking.duration.end}</span>
                        <Calendar size={12} className="text-rose-600" />
                      </div>
                    </div>
                  </td>

                  {/* Revenue Column */}
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-slate-900 text-base tracking-tight">
                        Rs. {booking.totalPrice.toLocaleString()}
                      </span>
                      <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                        booking.payment === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {booking.payment}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="p-8 bg-slate-50 rounded-full text-slate-300">
              <Inbox size={64} strokeWidth={1} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">No matching bookings</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs px-4">
                We couldn't find anything matching your search. Try a different name or vehicle.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;