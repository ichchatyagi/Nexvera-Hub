import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { AssistantMessageDto } from './dto/assistant-message.dto';
import { AiProvider } from './providers/ai-provider.interface';
import { StubAiProvider } from './providers/stub-ai.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private provider: AiProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {
    this.initProvider();
  }

  private initProvider() {
    const type = this.configService.get<string>('AI_PROVIDER');
    const apiKey = this.configService.get<string>('AI_API_KEY');
    const model = this.configService.get<string>('AI_MODEL') || 'gpt-3.5-turbo';

    if (type === 'openai' && apiKey) {
      this.provider = new OpenAiProvider(apiKey, model);
      this.logger.log('AI System: OpenAI Provider initialized');
    } else {
      this.provider = new StubAiProvider();
      this.logger.warn(
        'AI System: Stub Provider initialized (Check AI_API_KEY/AI_PROVIDER)',
      );
    }
  }

  async getStudentAssistantReply(userId: string, dto: AssistantMessageDto) {
    const context: any = { userId };
    let systemPrompt = `You are the Nexvera Hub Student Assistant. 
    You help students with their courses and learning journey. 
    Be helpful, concise, and professional. 
    Only suggest actions that are relevant and grounded in the provided context. 
    Do not hallucinate enrollment or payment status; rely only on the context.`;

    // 1. Load Course Context
    if (dto.courseIdOrSlug) {
      try {
        const courseRes = await this.coursesService.findBySlug(
          dto.courseIdOrSlug,
        );
        const course = courseRes.data;
        context.course = {
          id: course._id,
          title: course.title,
          slug: course.slug,
          category: course.category?.main,
          level: course.level,
          description:
            course.short_description || course.description?.substring(0, 300),
        };

        const curriculum = await this.coursesService.getCurriculum(
          course._id.toString(),
        );
        context.curriculum = curriculum.data?.map((s) => ({
          title: s.title,
          lessons: s.lessons.map((l) => ({ title: l.title, type: l.type })),
        }));

        systemPrompt += `\n\nYou are currently discussing the course: "${course.title}". 
        Level: ${course.level}. 
        Category: ${course.category?.main}. 
        Curriculum has ${curriculum.data?.length} sections.`;

        // 2. Load Enrollment Progress
        try {
          const progressRes = await this.enrollmentsService.getProgress(
            course._id.toString(),
            userId,
          );
          const enrollment = progressRes.data;
          context.enrollment = {
            status: enrollment.status,
            progress_percentage: enrollment.progress?.percentage,
            completed_count: enrollment.progress?.completed_lessons?.length,
          };
          systemPrompt += `\n\nThe student is enrolled. Current progress: ${enrollment.progress?.percentage}%. 
          They have completed ${enrollment.progress?.completed_lessons?.length} lessons.`;
        } catch (e) {
          systemPrompt += `\n\nThe student is NOT yet enrolled in this course.`;
        }
      } catch (error) {
        this.logger.error(
          `Context building failed for course: ${dto.courseIdOrSlug}`,
        );
      }
    }

    // 3. Load Lesson Context
    if (dto.lessonId) {
      try {
        const lessonRes = await this.coursesService.findLessonById(
          dto.lessonId,
        );
        const lesson = lessonRes.data;
        context.lesson = {
          id: lesson.lesson_id,
          title: lesson.title,
          type: lesson.type,
        };
        systemPrompt += `\n\nThe student is currently viewing the lesson: "${lesson.title}" (${lesson.type}).`;
      } catch (e) {
        this.logger.error(
          `Context building failed for lesson: ${dto.lessonId}`,
        );
      }
    }

    const response = await this.provider.generate({
      system: systemPrompt,
      messages: [{ role: 'user', content: dto.message }],
      context,
    });

    return {
      success: true,
      data: response,
    };
  }
}
