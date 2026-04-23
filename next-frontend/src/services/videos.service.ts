import api from '@/lib/api';

export const videosService = {
  getVideo: async (id: string) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  getPlaybackData: async (id: string): Promise<{ success: boolean; data?: any; error?: any }> => {
    try {
      const response = await api.get(`/videos/${id}/playback`);
      // If the interceptor unwrapped it, response.data is the payload
      // and (response as any).success is true.
      if ((response as any).success) {
        return { success: true, data: response.data };
      }
      
      // If it wasn't unwrapped (e.g. error payload with 200 status),
      // response.data will have { success: false, error: { ... } }
      if (response.data && response.data.success === false) {
        return response.data;
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }
};
