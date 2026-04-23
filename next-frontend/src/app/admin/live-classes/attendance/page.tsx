"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Search, 
  Calendar, 
  Users, 
  Video, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Activity,
  User,
  Book
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

interface AttendanceReport {
  totals: {
    total_classes: number;
    total_registered: number;
    total_attended: number;
    avg_attendance_rate: number;
  };
  by_day: Array<{
    day_utc: string;
    classes: number;
    registered: number;
    attended: number;
  }>;
}

export default function AttendanceReportPage() {
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
    courseId: '',
    teacherId: ''
  });

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/live-classes/attendance/report', { 
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          courseId: filters.courseId || undefined,
          teacherId: filters.teacherId || undefined
        }
      });
      setReport(data);
    } catch (error: any) {
      toast.error('Failed to fetch attendance report');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="px-6 lg:px-12 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Analytics Engine</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Attendance Report</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => fetchReport()}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 shadow-lg shadow-slate-950/10"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Sync Report
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-600/20 transition-all">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
            <Book size={20} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter by Course ID</label>
            <input 
              type="text"
              name="courseId"
              value={filters.courseId}
              onChange={handleFilterChange}
              placeholder="e.g. 69e4db6..."
              className="w-full bg-transparent text-sm font-black uppercase tracking-tight text-slate-950 focus:outline-none placeholder:text-slate-200"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-600/20 transition-all">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
            <User size={20} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter by Teacher ID</label>
            <input 
              type="text"
              name="teacherId"
              value={filters.teacherId}
              onChange={handleFilterChange}
              placeholder="e.g. user_uuid"
              className="w-full bg-transparent text-sm font-black uppercase tracking-tight text-slate-950 focus:outline-none placeholder:text-slate-200"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 border-dashed">
          <RefreshCw className="animate-spin text-blue-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Processing Aggregate Data...</p>
        </div>
      ) : report ? (
        <>
          {/* Totals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Video size={20} />
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Sessions</div>
              </div>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-1">{report.totals.total_classes}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concluded Sessions</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Users size={20} />
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Participation</div>
              </div>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-1">{report.totals.total_registered}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Registrations</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Activity size={20} />
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Presence</div>
              </div>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-1">{report.totals.total_attended}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attendance</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] bg-slate-950 border border-slate-900 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500">
                  <TrendingUp size={20} />
                </div>
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Performance</div>
              </div>
              <p className="text-4xl font-black text-white tracking-tighter mb-1">
                {report.totals.avg_attendance_rate.toFixed(1)}%
              </p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Attendance Rate</p>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
               <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">Daily Participation Breakdown</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">UTF-Bucket Time Series Analytics</p>
            </div>
            <div className="overflow-x-auto">
              {report.by_day.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date (UTC)</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Attended</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.by_day.map((day) => {
                      const rate = day.registered > 0 ? (day.attended / day.registered) * 100 : 0;
                      return (
                        <tr key={day.day_utc} className="group hover:bg-slate-50/30 transition-all">
                          <td className="px-8 py-6 text-xs font-black text-slate-950">{day.day_utc}</td>
                          <td className="px-8 py-6 text-xs font-black text-slate-600">{day.classes}</td>
                          <td className="px-8 py-6 text-xs font-black text-slate-600">{day.registered}</td>
                          <td className="px-8 py-6 text-xs font-black text-slate-600">{day.attended}</td>
                          <td className="px-8 py-6 text-right">
                             <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                               rate >= 75 ? 'bg-green-50 text-green-600' :
                               rate >= 50 ? 'bg-yellow-50 text-yellow-600' :
                               'bg-red-50 text-red-600'
                             }`}>
                               {rate.toFixed(1)}%
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center">
                  <AlertCircle className="text-slate-200 mb-4" size={48} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data available for the selected range</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
