import api from '@/lib/api';

export interface Course {
  id: string;
  _id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail_url: string;
  category: {
    main: string;
    sub: string;
  };
  level: 'beginner' | 'intermediate' | 'advanced';
  pricing: {
    price: number;
    currency: string;
  };
  stats: {
    average_rating: number;
    total_reviews: number;
    enrollments: number;
  };
  total_duration_hours: number;
  total_lessons: number;
}

export const coursesService = {
  listCourses: async (params?: any) => {
    const response = await api.get('/courses', { params });
    return {
      data: response.data as Course[],
      meta: (response as any).meta
    };
  },

  getCourse: async (idOrSlug: string): Promise<Course> => {
    // The backend handles both if we route correctly. 
    // Currently, Backend /courses/:slug handles slug.
    // Use the slug route as primary if it looks like a slug.
    const response = await api.get(`/courses/${idOrSlug}`);
    return response.data;
  },

  getCurriculum: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/curriculum`);
    return response.data;
  },

  getReviews: async (courseId: string, params?: any) => {
    const response = await api.get(`/courses/${courseId}/reviews`, { params });
    return {
      data: response.data,
      meta: (response as any).meta
    };
  }
};
