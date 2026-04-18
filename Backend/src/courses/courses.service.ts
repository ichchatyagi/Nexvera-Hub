import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateReviewDto,
  AssignInstructorDto,
} from './dto/course.dto';
import {
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/curriculum.dto';
import { UserRole } from '../users/entities/user.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly videosService: VideosService,
  ) {}

  async findAll(
    query: any = {},
    requesterId: string | null = null,
    requesterRole: UserRole | null = null,
  ) {
    const filters: any = {};
    if (query.category) filters['category.main'] = query.category;
    if (query.level) filters.level = query.level;
    if (query.price_type) filters['pricing.type'] = query.price_type;

    if (query.product_type) {
      filters.product_type = query.product_type;
    } else {
      filters.product_type = { $ne: 'tuition' }; // Keep existing behavior for regular courses
    }

    // Role-based status filtering
    const isAdmin = requesterRole === UserRole.ADMIN;
    if (!isAdmin) {
      // Force published always for non-admins
      filters.status = 'published';
    } else {
      // Admin can use status=all to bypass status filter
      if (query.status === 'all') {
        // No status filter
      } else {
        filters.status = query.status ?? 'published';
      }
    }

    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const trimmedSearch = query.search?.trim();
    let data;
    let total;

    if (trimmedSearch && trimmedSearch.length >= 2) {
      const sanitizedSearch = trimmedSearch.slice(0, 64);
      try {
        const textFilters = { ...filters, $text: { $search: sanitizedSearch } };
        data = await this.courseModel
          .find(textFilters)
          .skip(skip)
          .limit(limit)
          .select('-curriculum')
          .select({ score: { $meta: 'textScore' } })
          .sort({
            score: { $meta: 'textScore' },
            published_at: -1,
            created_at: -1,
          } as any)
          .exec();
        total = await this.courseModel.countDocuments(textFilters);
      } catch (err) {
        // Fallback to old regex behavior if index is missing
        const regexFilters = {
          ...filters,
          $or: [
            { title: { $regex: trimmedSearch, $options: 'i' } },
            { description: { $regex: trimmedSearch, $options: 'i' } },
          ],
        };
        data = await this.courseModel
          .find(regexFilters)
          .skip(skip)
          .limit(limit)
          .select('-curriculum')
          .sort({ published_at: -1, created_at: -1 })
          .exec();
        total = await this.courseModel.countDocuments(regexFilters);
      }
    } else {
      data = await this.courseModel
        .find(filters)
        .skip(skip)
        .limit(limit)
        .select('-curriculum')
        .sort({ published_at: -1, created_at: -1 })
        .exec();
      total = await this.courseModel.countDocuments(filters);
    }

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

  async findBySlug(
    slug: string,
    requesterId: string | null = null,
    requesterRole: UserRole | null = null,
  ) {
    let course = await this.courseModel
      .findOne({ slug, product_type: { $ne: 'tuition' } })
      .exec();

    // Fallback to ID lookup if slug doesn't match and it's a valid ObjectId
    if (!course && Types.ObjectId.isValid(slug)) {
      course = await this.courseModel
        .findOne({
          _id: new Types.ObjectId(slug),
          product_type: { $ne: 'tuition' },
        })
        .exec();
    }

    if (!course) throw new NotFoundException('Course not found');

    // Access control for non-published courses
    if (course.status !== 'published') {
      const isAdmin = requesterRole === UserRole.ADMIN;
      const isOwner = course.lead_instructor_id === requesterId;
      if (!isAdmin && !isOwner) {
        throw new NotFoundException('Course not found');
      }
    }

    return { success: true, data: course };
  }

  async getCurriculum(
    idOrSlug: string,
    requesterId: string | null = null,
    requesterRole: UserRole | null = null,
  ) {
    const isId = Types.ObjectId.isValid(idOrSlug);
    const query = isId
      ? { _id: new Types.ObjectId(idOrSlug) }
      : { slug: idOrSlug };

    const course = await this.courseModel.findOne(query).exec();

    if (!course) throw new NotFoundException('Course not found');

    // Access control for non-published courses
    if (course.status !== 'published') {
      const isAdmin = requesterRole === UserRole.ADMIN;
      const isOwner = course.lead_instructor_id === requesterId;
      if (!isAdmin && !isOwner) {
        throw new NotFoundException('Course not found');
      }
    }

    return { success: true, data: course.curriculum };
  }

  // ── Tuition Methods ──────────────────────────────────────────────────

  async findTuitionClasses(
    query: any = {},
    requesterId: string | null = null,
    requesterRole: UserRole | null = null,
  ) {
    const filters: any = { product_type: 'tuition' };

    // Role-based status filtering
    const isAdmin = requesterRole === UserRole.ADMIN;
    if (!isAdmin) {
      filters.status = 'published';
    } else {
      if (query.status === 'all') {
        // No filter
      } else {
        filters.status = query.status ?? 'published';
      }
    }

    if (query.class_level) {
      filters['tuition_meta.class_level'] = Number(query.class_level);
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const trimmedSearch = query.search?.trim();
    let data;
    let total;

    if (trimmedSearch && trimmedSearch.length >= 2) {
      const sanitizedSearch = trimmedSearch.slice(0, 64);
      try {
        const textFilters = { ...filters, $text: { $search: sanitizedSearch } };
        data = await this.courseModel
          .find(textFilters)
          .skip(skip)
          .limit(limit)
          .select('-tuition_meta.subjects.syllabus')
          .select({ score: { $meta: 'textScore' } })
          .sort({
            score: { $meta: 'textScore' },
            published_at: -1,
            created_at: -1,
          } as any)
          .exec();
        total = await this.courseModel.countDocuments(textFilters);
      } catch (err) {
        // Fallback to old regex behavior
        const regexFilters = {
          ...filters,
          $or: [
            { title: { $regex: trimmedSearch, $options: 'i' } },
            { description: { $regex: trimmedSearch, $options: 'i' } },
          ],
        };
        data = await this.courseModel
          .find(regexFilters)
          .skip(skip)
          .limit(limit)
          .select('-tuition_meta.subjects.syllabus')
          .sort({ published_at: -1, created_at: -1 })
          .exec();
        total = await this.courseModel.countDocuments(regexFilters);
      }
    } else {
      data = await this.courseModel
        .find(filters)
        .skip(skip)
        .limit(limit)
        .select('-tuition_meta.subjects.syllabus')
        .sort({ published_at: -1, created_at: -1 })
        .exec();
      total = await this.courseModel.countDocuments(filters);
    }

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

  async findTuitionClassBySlug(slug: string) {
    const filters = { product_type: 'tuition', slug, status: 'published' };
    const course = await this.courseModel
      .findOne(filters)
      .select('-tuition_meta.subjects.syllabus')
      .exec();

    if (!course) throw new NotFoundException('Tuition class not found');
    return { success: true, data: course };
  }

  async findTuitionSubject(classId: string, subjectSlug: string) {
    if (!Types.ObjectId.isValid(classId))
      throw new NotFoundException('Invalid class ID');

    const filters = {
      _id: new Types.ObjectId(classId),
      product_type: 'tuition',
      status: 'published',
    };

    // We fetch the whole document instead of complex projection, to ensure we can correctly validate
    const course = await this.courseModel.findOne(filters).exec();
    if (!course || !course.tuition_meta)
      throw new NotFoundException('Tuition class not found');

    const subject = course.tuition_meta.subjects?.find(
      (s) => s.slug === subjectSlug && s.status === 'published',
    );

    if (!subject) throw new NotFoundException('Tuition subject not found');

    return { success: true, data: subject };
  }

  async create(createDto: CreateCourseDto) {
    const created = await this.courseModel.create({
      ...createDto,
      status: 'draft',
    } as any);
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

  async findAssignedToTeacher(teacherId: string, role?: string) {
    // If admin, show all published and draft courses
    if (role === UserRole.ADMIN) {
      const courses = await this.courseModel.find().exec();
      return { success: true, data: courses };
    }

    // Returns courses where the teacher is either lead or in assigned list.
    const courses = await this.courseModel
      .find({
        $or: [
          { lead_instructor_id: teacherId },
          { assigned_instructor_ids: teacherId },
        ],
      })
      .exec();

    return { success: true, data: courses };
  }

  async getTeacherCourseView(id: string, teacherId: string, role?: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const query: any = { _id: new Types.ObjectId(id) };

    // If not admin, restrict to assigned courses
    if (role !== UserRole.ADMIN) {
      query.$or = [
        { lead_instructor_id: teacherId },
        { assigned_instructor_ids: teacherId },
      ];
    }

    const course = await this.courseModel.findOne(query).exec();

    if (!course) throw new ForbiddenException('Not assigned to this course');

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

    course.assigned_instructor_ids = course.assigned_instructor_ids.filter(
      (id) => id !== instructorId,
    );

    if (course.lead_instructor_id === instructorId) {
      course.lead_instructor_id = undefined; // Or leave TODO for reassignment
    }

    await course.save();
    return { success: true, data: course };
  }

  // ── Teacher Curriculum Management ──────────────────────────────────────

  async addSectionForTeacher(
    id: string,
    teacherId: string,
    dto: CreateSectionDto,
    role?: string,
  ) {
    const { data: course } = await this.getTeacherCourseView(
      id,
      teacherId,
      role,
    );

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

  async updateSectionForTeacher(
    id: string,
    teacherId: string,
    sectionId: string,
    dto: UpdateSectionDto,
    role?: string,
  ) {
    const { data: course } = await this.getTeacherCourseView(
      id,
      teacherId,
      role,
    );

    const sectionIndex = course.curriculum.findIndex(
      (s) => s.section_id.toString() === sectionId,
    );
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    if (dto.title) course.curriculum[sectionIndex].title = dto.title;
    if (dto.order !== undefined)
      course.curriculum[sectionIndex].order = dto.order;

    await course.save();
    return { success: true, data: course.curriculum[sectionIndex] };
  }

  async addLessonForTeacher(
    id: string,
    teacherId: string,
    sectionId: string,
    dto: CreateLessonDto,
    role?: string,
  ) {
    const { data: course } = await this.getTeacherCourseView(
      id,
      teacherId,
      role,
    );

    const sectionIndex = course.curriculum.findIndex(
      (s) => s.section_id.toString() === sectionId,
    );
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const content: any = {};
    if (dto.content) {
      if (
        dto.content.video_id &&
        Types.ObjectId.isValid(dto.content.video_id)
      ) {
        content.video_id = new Types.ObjectId(dto.content.video_id);
      }
      if (
        dto.content.live_class_id &&
        Types.ObjectId.isValid(dto.content.live_class_id)
      ) {
        content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      }
      if (dto.content.quiz_id && Types.ObjectId.isValid(dto.content.quiz_id)) {
        content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      }
      if (dto.content.resource_url)
        content.resource_url = dto.content.resource_url;
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

    // Sync preview status to Video document if applicable
    if (newLesson.type === 'video' && newLesson.content.video_id) {
      try {
        await this.videosService.setPublicPreview(
          newLesson.content.video_id.toString(),
          newLesson.is_preview === true,
        );
      } catch (err) {
        // Log but don't fail the lesson creation
        console.error(`Failed to sync public_preview for video ${newLesson.content.video_id}: ${err.message}`);
      }
    }

    return { success: true, data: newLesson };
  }

  async updateLessonForTeacher(
    id: string,
    teacherId: string,
    sectionId: string,
    lessonId: string,
    dto: UpdateLessonDto,
    role?: string,
  ) {
    const { data: course } = await this.getTeacherCourseView(
      id,
      teacherId,
      role,
    );

    const sectionIndex = course.curriculum.findIndex(
      (s) => s.section_id.toString() === sectionId,
    );
    if (sectionIndex === -1) throw new NotFoundException('Section not found');

    const lessonIndex = course.curriculum[sectionIndex].lessons.findIndex(
      (l) => l.lesson_id.toString() === lessonId,
    );
    if (lessonIndex === -1) throw new NotFoundException('Lesson not found');

    const lesson = course.curriculum[sectionIndex].lessons[lessonIndex];
    if (dto.title) lesson.title = dto.title;
    if (dto.type) lesson.type = dto.type;
    if (dto.order !== undefined) lesson.order = dto.order;
    if (dto.duration_minutes !== undefined)
      lesson.duration_minutes = dto.duration_minutes;
    if (dto.is_preview !== undefined) lesson.is_preview = dto.is_preview;

    if (dto.content) {
      if (!lesson.content) {
        lesson.content = {} as any;
      }
      const content = lesson.content!;
      if (
        dto.content.video_id &&
        Types.ObjectId.isValid(dto.content.video_id)
      ) {
        content.video_id = new Types.ObjectId(dto.content.video_id);
      }
      if (
        dto.content.live_class_id &&
        Types.ObjectId.isValid(dto.content.live_class_id)
      ) {
        content.live_class_id = new Types.ObjectId(dto.content.live_class_id);
      }
      if (dto.content.quiz_id && Types.ObjectId.isValid(dto.content.quiz_id)) {
        content.quiz_id = new Types.ObjectId(dto.content.quiz_id);
      }
      if (dto.content.resource_url)
        content.resource_url = dto.content.resource_url;
    }

    course.curriculum[sectionIndex].lessons[lessonIndex] = lesson;
    await course.save();

    // Sync preview status to Video document if applicable
    if (lesson.type === 'video' && lesson.content?.video_id) {
      try {
        await this.videosService.setPublicPreview(
          lesson.content.video_id.toString(),
          lesson.is_preview === true,
        );
      } catch (err) {
        console.error(`Failed to sync public_preview for video ${lesson.content.video_id}: ${err.message}`);
      }
    }

    return { success: true, data: lesson };
  }

  // REVIEWS
  async getReviews(courseId: string, query: any = {}) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid ID');

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const data = await this.reviewModel
      .find({ course_id: new Types.ObjectId(courseId), status: 'published' })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .exec();

    const total = await this.reviewModel.countDocuments({
      course_id: new Types.ObjectId(courseId),
      status: 'published',
    });

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

  async createReview(
    courseId: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: CreateReviewDto,
  ) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid ID');

    // Enforce enrollment requirement for students; admins bypass.
    if (requesterRole === UserRole.STUDENT) {
      const enrolled = await this.enrollmentsService.isActiveCourseEnrollment(
        courseId,
        requesterId,
      );
      if (!enrolled) {
        throw new ForbiddenException('Must be enrolled to leave a review');
      }
    }

    // Check if already reviewed
    const existing = await this.reviewModel.findOne({
      course_id: new Types.ObjectId(courseId),
      student_id: requesterId,
    });
    if (existing) {
      throw new ForbiddenException('You have already reviewed this course');
    }

    const review = await this.reviewModel.create({
      course_id: new Types.ObjectId(courseId),
      student_id: requesterId,
      rating: dto.rating,
      review_text: dto.review_text,
    });

    // Update course stats
    const course = await this.courseModel.findById(courseId);
    if (course) {
      const { stats } = course;
      stats.total_reviews += 1;
      // recalculate average rating
      // new_avg = (old_avg * (n-1) + new_rating) / n
      stats.average_rating =
        (stats.average_rating * (stats.total_reviews - 1) + dto.rating) /
        stats.total_reviews;
      course.stats = stats;
      await course.save();
    }

    return { success: true, data: review };
  }

  async findLessonById(
    lessonId: string,
    requesterId: string | null = null,
    requesterRole: UserRole | null = null,
  ) {
    if (!Types.ObjectId.isValid(lessonId))
      throw new NotFoundException('Invalid Lesson ID');

    const course = await this.courseModel
      .findOne({
        'curriculum.lessons.lesson_id': new Types.ObjectId(lessonId),
      })
      .exec();

    if (!course) throw new NotFoundException('Lesson not found');

    // Extract the lesson object
    let lesson: any = null;
    for (const section of course.curriculum) {
      lesson = section.lessons.find((l) => l.lesson_id.toString() === lessonId);
      if (lesson) break;
    }

    if (!lesson) throw new NotFoundException('Lesson not found in curriculum');

    // Access control
    const isOwner = course.lead_instructor_id === requesterId;
    const isAdmin = requesterRole === UserRole.ADMIN;

    // 1. If course is not published, only owner/admin can see lessons
    if (course.status !== 'published') {
      if (!isOwner && !isAdmin) {
        throw new ForbiddenException(
          'This course is not yet published. Only the instructor can access its content.',
        );
      }
      return { success: true, data: lesson };
    }

    // 2. Public preview bypass (only for published courses)
    if (lesson.is_preview === true) {
      return { success: true, data: lesson };
    }

    // 3. Paid content gate
    if (isAdmin || isOwner) {
      return { success: true, data: lesson };
    }

    if (requesterRole === UserRole.STUDENT && requesterId) {
      const isEnrolled = await this.enrollmentsService.isActiveCourseEnrollment(
        course._id.toString(),
        requesterId,
      );
      if (isEnrolled) {
        return { success: true, data: lesson };
      }
    }

    throw new ForbiddenException(
      'Enrollment required to access this lesson content.',
    );
  }
}
