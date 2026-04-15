import api from '@/lib/api';

export const paymentsService = {
  createOrder: async (courseId: string) => {
    const response = await api.post('/payments/order', { courseId });
    return response.data;
  },

  verifyPayment: async (data: any) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  getInstructorEarnings: async () => {
    const response = await api.get('/instructor/earnings');
    return response.data;
  }
};
