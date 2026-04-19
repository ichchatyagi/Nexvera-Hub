"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, CheckCircle2, Loader2, ArrowLeft, BellOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import { notificationsService, Notification } from '@/services/notifications.service';

type Filter = 'all' | 'unread';

const LIMIT = 20;

/** Human-readable relative time, e.g. "3 hours ago" */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

const TYPE_LABEL: Record<string, string> = {
  payment_confirmed: 'Payment',
  enrollment_granted: 'Enrollment',
  live_class_started: 'Live Class',
  live_class_ended: 'Live Class',
  live_class_recording_available: 'Recording',
};

const TYPE_COLOR: Record<string, string> = {
  payment_confirmed: 'bg-emerald-100 text-emerald-700',
  enrollment_granted: 'bg-blue-100 text-blue-700',
  live_class_started: 'bg-violet-100 text-violet-700',
  live_class_ended: 'bg-slate-100 text-slate-600',
  live_class_recording_available: 'bg-amber-100 text-amber-700',
};

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { markRead, markAllRead, unreadCount } = useNotifications();
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (nextPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const { data, meta } = await notificationsService.listMy({
          unread: filter === 'unread',
          page: nextPage,
          limit: LIMIT,
        });

        const fetched: Notification[] = data ?? [];
        setItems((prev) => (replace ? fetched : [...prev, ...fetched]));

        const totalPages = meta?.pagination?.total_pages ?? 1;
        const total = meta?.pagination?.total_items ?? meta?.pagination?.total ?? fetched.length;
        setTotalItems(total);
        setHasMore(nextPage < totalPages);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter],
  );

  // Reset + reload when filter changes
  useEffect(() => {
    setPage(1);
    setItems([]);
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPage(next, false);
  };

  const handleMarkRead = async (notif: Notification) => {
    if (notif.read_at !== null) return;
    // Optimistic local update
    setItems((prev) =>
      prev.map((n) =>
        n._id === notif._id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    await markRead(notif._id);
    // If viewing "unread only", remove it from the list
    if (filter === 'unread') {
      setItems((prev) => prev.filter((n) => n._id !== notif._id));
      setTotalItems((t) => Math.max(0, t - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    if (filter === 'unread') {
      setItems([]);
      setTotalItems(0);
      setHasMore(false);
    } else {
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
              {totalItems > 0 && (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
            >
              <CheckCircle2 size={15} />
              Mark all read
            </button>
          )}
        </div>

        {/* ── Filter tabs ────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 pb-0 flex gap-1">
          {(['all', 'unread'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all capitalize ${
                filter === f
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm font-semibold">Loading notifications…</span>
          </div>
        ) : items.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <BellOff size={28} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-600">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-sm mt-1">
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : "We'll notify you when something happens."}
              </p>
            </div>
            {filter === 'unread' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm font-semibold text-blue-600 hover:underline mt-2"
              >
                View all notifications →
              </button>
            )}
          </div>
        ) : (
          /* ── List ───────────────────────────────────────────────────── */
          <div className="flex flex-col gap-2">
            {items.map((notif) => (
              <button
                key={notif._id}
                onClick={() => handleMarkRead(notif)}
                className={`w-full text-left rounded-2xl border transition-all group ${
                  notif.read_at === null
                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100/60 shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="p-4 flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {notif.read_at === null ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 block" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Type badge + time */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          TYPE_COLOR[notif.type] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {TYPE_LABEL[notif.type] ?? notif.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                        {relativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                  </div>
                </div>
              </button>
            ))}

            {/* ── Load more ────────────────────────────────────────────── */}
            {hasMore && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Loading…
                    </>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
