import api from '@/lib/api';

export const videosService = {
  getVideo: async (id: string) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  getPlaybackData: async (id: string) => {
    const response = await api.get(`/videos/${id}/playback`);
    return response.data;
  }
};
