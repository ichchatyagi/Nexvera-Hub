import api from '@/lib/api';

export type NotificationType =
  | 'payment_confirmed'
  | 'enrollment_granted'
  | 'live_class_started'
  | 'live_class_ended'
  | 'live_class_recording_available';

export interface Notification {
  _id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export const notificationsService = {
  async listMy(params?: { unread?: boolean; page?: number; limit?: number }) {
    const resp = await api.get('/notifications', { params });
    // api unwraps { success, data, meta }
    return { data: resp.data, meta: (resp as any).meta };
  },

  async markRead(id: string) {
    const resp = await api.post(`/notifications/${id}/read`);
    return resp;
  },

  async markAllRead() {
    const resp = await api.post('/notifications/read-all');
    return resp;
  },

  async getUnreadCount(): Promise<number> {
    const { meta } = await this.listMy({ unread: true, limit: 1, page: 1 });
    return meta?.pagination?.total_items || 0;
  }
};
