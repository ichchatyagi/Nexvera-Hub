import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateCourseDto, UpdateCourseDto, CreateReviewDto, AssignInstructorDto } from './dto/course.dto';
import { CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/curriculum.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async findAll(query: any = {}) {
    const filters: any = {};
    if (query.category) filters['category.main'] = query.category;
    if (query.level) filters.level = query.level;
    if (query.price_type) filters['pricing.type'] = query.price_type;
    // Default to published courses for the public listing.
    // Pass ?status=draft etc. only if you expose a specific admin endpoint later.
    filters.status = query.status ?? 'published';

    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const data = await this.courseModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .select('-curriculum') // Don't return full curriculum on listing
      .exec();

    const total = await this.courseModel.countDocuments(filters);

    return {
      success: true,
      data,
      meta: {
        pagination: {
          page,
          per_page: limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findBySlug(slug: string) {
    const course = await this.courseModel.findOne({ slug }).exec();
    if (!course) throw new NotFoundException('Course not found');
    return { success: true, data: course };
  }

  async getCurriculum(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).select('curriculum').exec();
    if (!course) throw new NotFoundException('Course not found');
    return { success: true, data: course.curriculum };
  }

  async create(createDto: CreateCourseDto) {
    const created = await this.courseModel.create({
      ...createDto,
      status: 'draft',
    });
    return { success: true, data: created };
  }

  async update(id: string, updateDto: UpdateCourseDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    
    Object.assign(course, updateDto);
    await course.save();

    return { success: true, data: course };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    await this.courseModel.findByIdAndDelete(id).exec();
    return { success: true, data: { deleted: true } };
  }

  async publish(id: string, status: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    if (!['pending_review', 'published', 'draft'].includes(status)) {
        status = 'pending_review';
    }

    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    course.status = status;
    if (status === 'published') {
        course.published_at = new Date();
    }
    await course.save();
    return { success: true, data: course };
  }

  async findAssignedToTeacher(teacherId: string) {
    // Returns courses where the teacher is either lead or in assigned list.
    const courses = await this.courseModel.find({
      $or: [
        { lead_instructor_id: teacherId },
        { assigned_instructor_ids: teacherId }
      ]
    }).exec();
    
    return { success: true, data: courses };
  }

  async getTeacherCourseView(id: string, teacherId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(id),
      $or: [
        { lead_instructor_id: teacherId },
        { assigned_instructor_ids: teacherId }
      ]
    }).exec();

    if (!course) throw new ForbiddenException('Not assigned to this course');

    // In a mature app, this would include roster, schedule, etc.
    return { success: true, data: course };
  }

  // ── Admin Assignment ──────────────────────────────────────────────────

  async assignInstructor(id: string, dto: AssignInstructorDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    if (dto.is_lead) {
      course.lead_instructor_id = dto.instructor_id;
    }

    if (!course.assigned_instructor_ids.includes(dto.instructor_id)) {
      course.assigned_instructor_ids.push(dto.instructor_id);
    }

    await course.save();
    return { success: true, data: course };
  }

  async unassignInstructor(id: string, instructorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    course.assigned_instructor_ids = course.assigned_instructor_ids.filter(id => id !== instructorId);
    
    if (course.lead_instructor_id === instructorId) {
      course.lead_instructor_id = undefined; // Or leave TODO for reassignment
    }

    await course.save();
    return { success: true, data: course };
  }

  // ── Teacher Curriculum Management ──────────────────────────────────────

  async addSectionForTeacher(id: string, teacherId: string, dto: CreateSectionDto) {
    const { data: course } = await this.getTeacherCourseView(id, teacherId);
    
    const newSection = {
      section_id: new Types.ObjectId(),
      title: dto.title,
      order: dto.order ?? course.curriculum.length,
      lessons: [],
    };

    course.curriculum.push(newSection);
    await course.save();
    return { success: true, data: newSection };
  }

  async updateSectionForTeacher(id: string, teacherId: string, sectionId: string, dto: UpdateSectionDto) {
    const { data: course } = await this.getTeacherCourseView(id, teacherId);
    
    const sectionIndex = course.curriculum.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    if (dto.title) course.curriculum[sectionIndex].title = dto.title;
    if (dto.order !== undefined) course.curriculum[sectionIndex].order = dto.order;

    await course.save();
    return { success: true, data: course.curriculum[sectionIndex] };
  }

  async addLessonForTeacher(id: string, teacherId: string, sectionId: string, dto: CreateLessonDto) {
    const { data: course } = await this.getTeacherCourseView(id, teacherId);
    
    const sectionIndex = course.curriculum.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const content: any = {};
    if (dto.content) {
      if (dto.content.video_id) content.video_id = new Types.ObjectId(dto.content.video_id);
      if (dto.content.live_class_id) content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      if (dto.content.quiz_id) content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      if (dto.content.resource_url) content.resource_url = dto.content.resource_url;
    }

    const newLesson = {
      lesson_id: new Types.ObjectId(),
      title: dto.title,
      type: dto.type,
      order: dto.order ?? course.curriculum[sectionIndex].lessons.length,
      duration_minutes: dto.duration_minutes,
      is_preview: dto.is_preview ?? false,
      content,
    };

    course.curriculum[sectionIndex].lessons.push(newLesson as any);
    await course.save();
    return { success: true, data: newLesson };
  }

  async updateLessonForTeacher(id: string, teacherId: string, sectionId: string, lessonId: string, dto: UpdateLessonDto) {
    const { data: course } = await this.getTeacherCourseView(id, teacherId);
    
    const sectionIndex = course.curriculum.findIndex(s => s.section_id.toString() === sectionId);
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const lessonIndex = course.curriculum[sectionIndex].lessons.findIndex(l => l.lesson_id.toString() === lessonId);
    if (lessonIndex === -1) throw new NotFoundException('Lesson not found');

    const lesson = course.curriculum[sectionIndex].lessons[lessonIndex];
    if (dto.title) lesson.title = dto.title;
    if (dto.type) lesson.type = dto.type;
    if (dto.order !== undefined) lesson.order = dto.order;
    if (dto.duration_minutes !== undefined) lesson.duration_minutes = dto.duration_minutes;
    if (dto.is_preview !== undefined) lesson.is_preview = dto.is_preview;
    
    if (dto.content) {
      if (!lesson.content) {
        lesson.content = {} as any;
      }
      const content = lesson.content!;
      if (dto.content.video_id) content.video_id = new Types.ObjectId(dto.content.video_id);
      if (dto.content.live_class_id) content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      if (dto.content.quiz_id) content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      if (dto.content.resource_url) content.resource_url = dto.content.resource_url;
    }

    course.curriculum[sectionIndex].lessons[lessonIndex] = lesson;
    await course.save();
    
    return { success: true, data: lesson };
  }

  // REVIEWS
  async getReviews(courseId: string, query: any = {}) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid ID');
    
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const data = await this.reviewModel
      .find({ course_id: new Types.ObjectId(courseId), status: 'published' })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .exec();

    const total = await this.reviewModel.countDocuments({ course_id: new Types.ObjectId(courseId), status: 'published' });

    return {
      success: true,
      data,
      meta: {
        pagination: { page, per_page: limit, total, total_pages: Math.ceil(total / limit) },
      },
    };
  }

  async createReview(courseId: string, studentId: string, dto: CreateReviewDto) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid ID');

    // TODO: Verify the student is enrolled before allowing a review.
    // Inject EnrollmentsService (or the Enrollment model directly) and call:
    //   const enrollment = await this.enrollmentsService.findOne(courseId, studentId);
    //   if (!enrollment) throw new ForbiddenException('Must be enrolled to leave a review');

    // Check if already reviewed
    const existing = await this.reviewModel.findOne({ course_id: new Types.ObjectId(courseId), student_id: studentId });
    if (existing) {
        throw new ForbiddenException('You have already reviewed this course');
    }

    const review = await this.reviewModel.create({
        course_id: new Types.ObjectId(courseId),
        student_id: studentId,
        rating: dto.rating,
        review_text: dto.review_text,
    });

    // Update course stats
    const course = await this.courseModel.findById(courseId);
    if (course) {
        const { stats } = course;
        stats.total_reviews += 1;
        // recalculate average rating
        // For accurate recalculation we should query all reviews, but for now exact math:
        // new_avg = (old_avg * (n-1) + new_rating) / n
        stats.average_rating = ((stats.average_rating * (stats.total_reviews - 1)) + dto.rating) / stats.total_reviews;
        course.stats = stats;
        await course.save();
    }

    return { success: true, data: review };
  }
}
