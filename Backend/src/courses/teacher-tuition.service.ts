import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { ProductType } from './dto/course.dto';
import { CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/curriculum.dto';

@Injectable()
export class TeacherTuitionService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Find all tuition active subjects that the teacher is assigned to across all classes
  async findAssignedSubjects(teacherId: string) {
    const rawCourses = await this.courseModel.find({
      product_type: ProductType.TUITION,
      $or: [
        { 'tuition_meta.subjects.lead_instructor_id': teacherId },
        { 'tuition_meta.subjects.assigned_instructor_ids': teacherId }
      ]
    }).exec();

    // Flatten the result to just return the subjects they are assigned to, along with parent class context
    const assignedSubjects: any[] = [];
    for (const course of rawCourses) {
      if (!course.tuition_meta || !course.tuition_meta.subjects) continue;
      
      const teacherSubjects = course.tuition_meta.subjects.filter(
        s => s.lead_instructor_id === teacherId || s.assigned_instructor_ids?.includes(teacherId)
      );

      for (const subject of teacherSubjects) {
        assignedSubjects.push({
          class: {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            thumbnail_url: course.thumbnail_url,
            status: course.status,
            class_level: course.tuition_meta.class_level,
          },
          subject,
        });
      }
    }

    return { success: true, data: assignedSubjects };
  }

  // Get a single teaching view for a specific subject
  async getSubjectTeachingView(subjectId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({
      product_type: ProductType.TUITION,
      'tuition_meta.subjects.subject_id': new Types.ObjectId(subjectId)
    }).exec();

    if (!course || !course.tuition_meta || !course.tuition_meta.subjects) {
      throw new NotFoundException('Parent tuition class not found');
    }

    const subject = course.tuition_meta.subjects.find(s => s.subject_id.toString() === subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    const isAssigned = subject.lead_instructor_id === teacherId || subject.assigned_instructor_ids?.includes(teacherId);
    if (!isAssigned) throw new ForbiddenException('Not assigned to this subject');

    return { 
      success: true, 
      data: {
        class: {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          status: course.status,
          class_level: course.tuition_meta.class_level,
        },
        subject
      }
    };
  }

  // Curriculum Management
  
  private async getCourseAndAssignedSubject(subjectId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({
      product_type: ProductType.TUITION,
      'tuition_meta.subjects.subject_id': new Types.ObjectId(subjectId)
    }).exec();

    if (!course || !course.tuition_meta || !course.tuition_meta.subjects) {
      throw new NotFoundException('Parent tuition class not found');
    }
    
    const subjectIndex = course.tuition_meta.subjects.findIndex(s => s.subject_id.toString() === subjectId);
    if (subjectIndex === -1) throw new NotFoundException('Subject not found');
    
    const subject = course.tuition_meta.subjects[subjectIndex];
    if (!subject.syllabus) {
      subject.syllabus = [];
    }

    const isAssigned = subject.lead_instructor_id === teacherId || subject.assigned_instructor_ids?.includes(teacherId);
    
    if (!isAssigned) throw new ForbiddenException('Not assigned to this subject');

    return { course, subjectIndex, subject };
  }

  async addSection(subjectId: string, teacherId: string, dto: CreateSectionDto) {
    const { course, subjectIndex, subject } = await this.getCourseAndAssignedSubject(subjectId, teacherId);

    const newSection = {
      section_id: new Types.ObjectId(),
      title: dto.title,
      order: dto.order ?? subject.syllabus.length,
      lessons: [],
    };

    course.tuition_meta!.subjects[subjectIndex].syllabus.push(newSection as any);
    await course.save();

    return { success: true, data: newSection };
  }

  async updateSection(subjectId: string, teacherId: string, sectionId: string, dto: UpdateSectionDto) {
    if (!Types.ObjectId.isValid(sectionId)) throw new BadRequestException('Invalid section ID');
    const { course, subjectIndex, subject } = await this.getCourseAndAssignedSubject(subjectId, teacherId);

    const sectionIndex = subject.syllabus.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const section = subject.syllabus[sectionIndex];
    if (dto.title) section.title = dto.title;
    if (dto.order !== undefined) section.order = dto.order;

    course.tuition_meta!.subjects[subjectIndex].syllabus[sectionIndex] = section;
    await course.save();

    return { success: true, data: section };
  }

  async addLesson(subjectId: string, teacherId: string, sectionId: string, dto: CreateLessonDto) {
    if (!Types.ObjectId.isValid(sectionId)) throw new BadRequestException('Invalid section ID');
    const { course, subjectIndex, subject } = await this.getCourseAndAssignedSubject(subjectId, teacherId);

    const sectionIndex = subject.syllabus.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const section = subject.syllabus[sectionIndex];

    const content: any = {};
    if (dto.content) {
      if (dto.content.video_id && Types.ObjectId.isValid(dto.content.video_id)) {
        content.video_id = new Types.ObjectId(dto.content.video_id);
      }
      if (dto.content.live_class_id && Types.ObjectId.isValid(dto.content.live_class_id)) {
        content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      }
      if (dto.content.quiz_id && Types.ObjectId.isValid(dto.content.quiz_id)) {
        content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      }
      if (dto.content.resource_url) content.resource_url = dto.content.resource_url;
    }

    if (!section.lessons) {
      section.lessons = [];
    }

    const newLesson = {
      lesson_id: new Types.ObjectId(),
      title: dto.title,
      type: dto.type,
      order: dto.order ?? section.lessons.length,
      duration_minutes: dto.duration_minutes,
      is_preview: dto.is_preview ?? false,
      content,
    };

    course.tuition_meta!.subjects[subjectIndex].syllabus[sectionIndex].lessons.push(newLesson as any);
    await course.save();

    return { success: true, data: newLesson };
  }

  async updateLesson(subjectId: string, teacherId: string, sectionId: string, lessonId: string, dto: UpdateLessonDto) {
    if (!Types.ObjectId.isValid(sectionId)) throw new BadRequestException('Invalid section ID');
    if (!Types.ObjectId.isValid(lessonId)) throw new BadRequestException('Invalid lesson ID');
    const { course, subjectIndex, subject } = await this.getCourseAndAssignedSubject(subjectId, teacherId);

    const sectionIndex = subject.syllabus.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const section = subject.syllabus[sectionIndex];
    if (!section.lessons) throw new NotFoundException('Lesson not found');
    
    const lessonIndex = section.lessons.findIndex(l => l.lesson_id.toString() === lessonId);
    if (lessonIndex === -1) throw new NotFoundException('Lesson not found');

    const lesson = section.lessons[lessonIndex];

    if (dto.title) lesson.title = dto.title;
    if (dto.type) lesson.type = dto.type;
    if (dto.order !== undefined) lesson.order = dto.order;
    if (dto.duration_minutes !== undefined) lesson.duration_minutes = dto.duration_minutes;
    if (dto.is_preview !== undefined) lesson.is_preview = dto.is_preview;

    if (dto.content) {
      if (!lesson.content) lesson.content = {} as any;
      const content = lesson.content!;
      if (dto.content.video_id && Types.ObjectId.isValid(dto.content.video_id)) {
        content.video_id = new Types.ObjectId(dto.content.video_id);
      }
      if (dto.content.live_class_id && Types.ObjectId.isValid(dto.content.live_class_id)) {
        content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      }
      if (dto.content.quiz_id && Types.ObjectId.isValid(dto.content.quiz_id)) {
        content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      }
      if (dto.content.resource_url) content.resource_url = dto.content.resource_url;
    }

    course.tuition_meta!.subjects[subjectIndex].syllabus[sectionIndex].lessons[lessonIndex] = lesson;
    await course.save();

    return { success: true, data: lesson };
  }

  async publishSubject(subjectId: string, teacherId: string) {
    const { course, subjectIndex, subject } = await this.getCourseAndAssignedSubject(subjectId, teacherId);
    
    subject.status = 'published';
    course.tuition_meta!.subjects[subjectIndex] = subject;
    
    await course.save();
    return { success: true, data: { status: 'published' } };
  }
}
