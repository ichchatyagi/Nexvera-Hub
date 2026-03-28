import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateCourseDto, UpdateCourseDto, CreateReviewDto } from './dto/course.dto';

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

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    return { success: true, data: course };
  }

  async incrementEnrollments(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid ID');
    await this.courseModel.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrollments': 1 },
    });
  }

  async create(teacherId: string, createDto: CreateCourseDto) {
    const created = await this.courseModel.create({
      ...createDto,
      teacher_id: teacherId,
      status: 'draft',
    });
    return { success: true, data: created };
  }

  async update(id: string, teacherId: string, updateDto: UpdateCourseDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    
    // Check ownership
    if (course.teacher_id !== teacherId) throw new ForbiddenException('Not your course');

    Object.assign(course, updateDto);
    await course.save();

    return { success: true, data: course };
  }

  async remove(id: string, teacherId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    
    if (course.teacher_id !== teacherId) throw new ForbiddenException('Not your course');

    await this.courseModel.findByIdAndDelete(id).exec();
    return { success: true, data: { deleted: true } };
  }

  async publish(id: string, teacherId: string, status: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    if (!['pending_review', 'published', 'draft'].includes(status)) {
        status = 'pending_review';
    }

    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    
    if (course.teacher_id !== teacherId) throw new ForbiddenException('Not your course');

    course.status = status;
    if (status === 'published') {
        course.published_at = new Date();
    }
    await course.save();
    return { success: true, data: course };
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
