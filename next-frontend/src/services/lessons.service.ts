import api from '@/lib/api';

export interface Lesson {
  lesson_id: string;
  _id: string;
  title: string;
  type: 'video' | 'live_class' | 'quiz' | 'assignment' | 'resource';
  duration_minutes?: number;
  is_preview: boolean;
  order: number;
  content?: {
    video_id?: string;
    live_class_id?: string;
    quiz_id?: string;
    resource_url?: string;
  };
}

export const lessonsService = {
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  }
};
