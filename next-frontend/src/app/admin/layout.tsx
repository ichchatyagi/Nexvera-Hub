"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  IndianRupee, 
  Video, 
  CreditCard, 
  BarChart3,
  Shield,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Instructors & Earnings', href: '/admin/instructors/earnings', icon: IndianRupee },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Live Classes', href: '/admin/live-classes', icon: Video },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        toast.error('Unauthorized access');
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Initializing Admin Console</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-950 uppercase tracking-tighter">Nexvera Hub</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Admin Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar pt-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${
                  isActive 
                    ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/10' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-blue-500' : 'group-hover:text-blue-500 transition-colors'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
               {user.name?.charAt(0) || 'A'}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-black text-slate-950 uppercase truncate">{user.name}</p>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-slate-950" />
          <span className="text-xs font-black text-slate-950 uppercase tracking-tighter">Nexvera Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-slate-950" />
                <span className="text-xs font-black text-slate-950 uppercase tracking-tighter">Nexvera Admin</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/10' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-blue-500' : ''} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-6 border-t border-slate-50">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-black">
                   {user.name?.charAt(0) || 'A'}
                 </div>
                 <div>
                   <p className="text-xs font-black text-slate-950 uppercase truncate">{user.name}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden lg:flex items-center justify-between px-12 py-8 bg-transparent">
           <div>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Operations Management</h2>
              <div className="flex items-center gap-3">
                 <Shield size={14} className="text-blue-600" />
                 <h1 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Nexvera Admin Console</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-xs font-black text-slate-950 uppercase tracking-tight">{user.name}</p>
                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Authority Session</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                 <Users size={20} />
              </div>
           </div>
        </header>

        <div className="pt-24 lg:pt-0 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
