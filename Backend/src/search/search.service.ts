import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../courses/schemas/course.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Escapes regex metacharacters to prevent regex injection.
   */
  escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async suggest(q: string) {
    const rawQuery = (q || '').trim();
    if (rawQuery.length < 2) {
      return {
        success: true,
        data: {
          courses: [],
          tuition_classes: [],
          tuition_subjects: [],
        },
      };
    }

    // Cap length to 64 chars
    const sanitizedQuery = rawQuery.substring(0, 64);
    const escaped = this.escapeRegex(sanitizedQuery);
    const regex = new RegExp(escaped, 'i');

    const [courses, tuitionClasses, tuitionSubjects] = await Promise.all([
      this.getCourseSuggestions(regex),
      this.getTuitionClassSuggestions(regex),
      this.getTuitionSubjectSuggestions(escaped),
    ]);

    return {
      success: true,
      data: {
        courses,
        tuition_classes: tuitionClasses,
        tuition_subjects: tuitionSubjects,
      },
    };
  }

  private async getCourseSuggestions(regex: RegExp) {
    const docs = await this.courseModel
      .find({
        product_type: { $ne: 'tuition' },
        status: 'published',
        title: { $regex: regex },
      })
      .sort({ published_at: -1, created_at: -1 })
      .limit(6)
      .select('_id slug title thumbnail_url category.main level')
      .lean()
      .exec();

    return docs.map((doc: any) => ({
      type: 'course',
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      thumbnail_url: doc.thumbnail_url || null,
      category_main: doc.category?.main || null,
      level: doc.level || null,
    }));
  }

  private async getTuitionClassSuggestions(regex: RegExp) {
    const docs = await this.courseModel
      .find({
        product_type: 'tuition',
        status: 'published',
        title: { $regex: regex },
      })
      .sort({ published_at: -1, created_at: -1 })
      .limit(6)
      .select('_id slug title tuition_meta.class_level')
      .lean()
      .exec();

    return docs.map((doc: any) => ({
      type: 'tuition_class',
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      class_level: doc.tuition_meta?.class_level || null,
    }));
  }

  private async getTuitionSubjectSuggestions(escapedQuery: string) {
    const results = await this.courseModel
      .aggregate([
        {
          $match: {
            product_type: 'tuition',
            status: 'published',
            'tuition_meta.subjects.0': { $exists: true },
          },
        },
        { $unwind: '$tuition_meta.subjects' },
        {
          $match: {
            'tuition_meta.subjects.name': { $regex: escapedQuery, $options: 'i' },
          },
        },
        {
          $project: {
            _id: 0,
            classId: { $toString: '$_id' },
            classSlug: '$slug',
            classTitle: '$title',
            class_level: '$tuition_meta.class_level',
            subjectId: { $toString: '$tuition_meta.subjects.subject_id' },
            subjectSlug: '$tuition_meta.subjects.slug',
            subjectName: '$tuition_meta.subjects.name',
          },
        },
        { $limit: 6 },
      ])
      .exec();

    return results.map((res) => ({
      type: 'tuition_subject',
      ...res,
    }));
  }
}
