import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  Search,
  Mail,
  Phone,
  UserMinus,
  UserCheck,
  Inbox,
  Hash,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '../../../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (roleFilter)      params.append('role', roleFilter);
      if (statusFilter)    params.append('status', statusFilter);

      const res = await api.get(`/users/all?${params.toString()}`);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId, userName, currentStatus) => {
    const action = currentStatus === 'active' ? 'restrict' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) return;

    setTogglingId(userId);
    try {
      const res = await api.patch(`/users/${userId}/status`);
      const updatedUser = res.data.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: updatedUser.status } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user.`);
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin:    'bg-purple-100 text-purple-700 border border-purple-200',
      // owner:    'bg-amber-100 text-amber-700 border border-amber-200',
      customer: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return styles[role] || styles.customer;
  };

  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] min-h-screen font-sans">

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm font-medium">Customer Ecosystem Management</p>
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Filters + Total */}
        <div className="justify-self-end flex items-center gap-3 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400 transition"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            {/* <option value="owner">Owner</option> */}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400 transition"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="restricted">Restricted</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <div className="bg-white border border-slate-100 rounded-[1.5rem] px-6 py-4 shadow-xl shadow-slate-200/40 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">

        {isLoading && (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin text-indigo-400" />
            <p className="text-sm font-semibold">Loading users...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <p className="text-rose-500 font-semibold">{error}</p>
            <button onClick={fetchUsers} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isRestricted = user.status === 'restricted';
                  const isToggling = togglingId === user._id;

                  return (
                    <tr key={user._id} className={`group transition-all duration-300 ${isRestricted ? 'bg-rose-50/40' : 'hover:bg-indigo-50/30'}`}>

                      {/* Profile */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-md group-hover:rotate-3 transition-transform duration-300 ${isRestricted ? 'border-rose-200 grayscale' : 'border-white'}`}>
                              <img
                                src={user.avatar}
                                alt={user.fullname}
                                className="w-full h-full object-cover bg-slate-50"
                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`; }}
                              />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isRestricted ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm tracking-tight ${isRestricted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {user.fullname}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Hash size={10} /> {user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                              <Mail size={12} />
                            </div>
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                              <Phone size={12} />
                            </div>
                            {user.phone}
                          </div>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-700">{formatDate(user.createdAt)}</span>
                      </td>

                      {/* Role */}
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${isRestricted ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>

                      {/* Action — hidden for admins */}
                      <td className="px-8 py-6 text-right">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(user._id, user.fullname, user.status || 'active')}
                            disabled={isToggling}
                            title={isRestricted ? 'Reactivate User' : 'Restrict User'}
                            className={`p-3 border border-transparent rounded-xl transition-all duration-200 ${
                              isToggling ? 'opacity-50 cursor-not-allowed' :
                              isRestricted
                                ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100'
                            }`}
                          >
                            {isToggling ? <Loader2 size={20} className="animate-spin" /> : isRestricted ? <UserCheck size={20} /> : <UserMinus size={20} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="p-8 bg-slate-50 rounded-full text-slate-300">
                  <Inbox size={64} strokeWidth={1} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">No users found</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs px-4">
                    No profiles match your search. Try a different name, email, or filter.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;