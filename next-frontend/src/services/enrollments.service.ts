import api from '@/lib/api';

export interface Enrollment {
  id: string;
  _id: string;
  course_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'expired';
  progress: {
    percentage: number;
    completed_lessons: string[];
    last_accessed: string;
  };
  course?: any;
}

export const enrollmentsService = {
  getMyLearning: async (): Promise<Enrollment[]> => {
    const response = await api.get('/enrollments/my-learning');
    // Backend returns { success: true, data: [...] }
    return response.data?.data ?? response.data ?? [];
  },

  enroll: async (courseId: string) => {
    const response = await api.post(`/enrollments/${courseId}/enroll`);
    return response.data;
  },

  getProgress: async (courseId: string) => {
    const response = await api.get(`/enrollments/${courseId}/progress`);
    return response.data;
  },

  updateProgress: async (courseId: string, data: { percentage?: number; current_lesson?: string; completed_lessons?: string[] }) => {
    const response = await api.put(`/enrollments/${courseId}/progress`, data);
    return response.data;
  }
};
