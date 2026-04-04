"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Loader2,
  CheckCircle,
  X,
  Shield,
  User,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Mail,
  Calendar,
  MoreVertical,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  emailVerified: boolean;
}

const AdminUsersDashboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Update state
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response: any = await api.get('/users', { params });
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load user intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      setIsUpdating(userId);
      toast.loading('Recalibrating authority...', { id: 'role-update' });
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Authority recalibrated', { id: 'role-update' });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authorization shift failed', { id: 'role-update' });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      setIsUpdating(userId);
      toast.loading('Adjusting status...', { id: 'status-update' });
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success('Status adjusted', { id: 'status-update' });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Status adjustment failed', { id: 'status-update' });
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <ShieldCheck size={14} className="text-blue-600" />;
      case UserRole.MODERATOR: return <Shield size={14} className="text-cyan-500" />;
      case UserRole.TEACHER: return <UserCheck size={14} className="text-orange-500" />;
      default: return <User size={14} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-600 border-green-100';
      case 'suspended': return 'bg-red-50 text-red-600 border-red-100';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Identity Protocol</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Personnel Intelligence</span>
            </div>
            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Users</span>
            </h1>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Authority Level</label>
                    <div className="relative">
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs appearance-none transition-all"
                        >
                            <option value="">All Levels</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Protocol Status</label>
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs appearance-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Identity Search</label>
                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all focus-within:border-blue-200">
                            <Search className="text-slate-400 mr-4" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by email address..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-4 bg-transparent outline-none text-xs font-bold placeholder:text-slate-300"
                            />
                        </div>
                        <button 
                            onClick={fetchUsers}
                            className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* User List Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Authority</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Registry</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 border border-slate-200">
                           <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight mb-1">{user.email}</p>
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-slate-300'}`} />
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {user.emailVerified ? 'Verified' : 'Pending Verification'}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            {getRoleIcon(user.role)}
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-700">
                                {user.role}
                            </span>
                        </div>
                        <select 
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                            disabled={isUpdating === user.id}
                            className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-blue-200 appearance-none cursor-pointer"
                        >
                            <option value="student">STUDENT</option>
                            <option value="teacher">TEACHER</option>
                            <option value="moderator">MODERATOR</option>
                            <option value="admin">ADMIN</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(user.status)}`}>
                            {user.status}
                        </div>
                        <select 
                            value={user.status}
                            onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                            disabled={isUpdating === user.id}
                            className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-blue-200 appearance-none cursor-pointer"
                        >
                            <option value="active">ACTIVE</option>
                            <option value="suspended">SUSPENDED</option>
                            <option value="pending">PENDING</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[11px] font-bold tracking-tight">
                            {new Date(user.createdAt).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => router.push(`/admin/enrollments/user/${user.id}`)}
                        className="p-3 rounded-2xl bg-slate-50 text-slate-300 hover:bg-white hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-blue-500/10"
                        title="Enrollment Portfolio"
                      >
                        <BookOpen size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!isLoading && users.length === 0 && (
            <div className="py-32 text-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200"
               >
                  <Users size={40} />
               </motion.div>
               <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No Personnel Detected</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">The identity registry returned zero matches for the current query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersDashboard;
