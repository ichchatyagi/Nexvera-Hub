import api from '@/lib/api';

export const liveClassesService = {
  listLiveClasses: async (params?: any) => {
    const response = await api.get('/live-classes', { params });
    return response.data;
  },

  getLiveClass: async (id: string) => {
    const response = await api.get(`/live-classes/${id}`);
    return response.data;
  },

  joinLiveClass: async (id: string) => {
    const response = await api.post(`/live-classes/${id}/join`);
    return response.data;
  }
};
