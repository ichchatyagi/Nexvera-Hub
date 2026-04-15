import api from '@/lib/api';

export interface AiAssistantResponse {
  reply: string;
  suggested_actions?: { label: string; href: string }[];
}

export const aiService = {
  getStudentAssistantReply: async (params: {
    message: string;
    courseIdOrSlug?: string;
    lessonId?: string;
  }): Promise<AiAssistantResponse> => {
    const response = await api.post('/ai/student-assistant', params);
    return response.data;
  },
};
