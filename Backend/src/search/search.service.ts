import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    
    // Constraint: min 2, max 64
    if (rawQuery.length < 2 || rawQuery.length > 64) {
      return {
        success: true,
        data: {
          courses: [],
          tuition_classes: [],
          tuition_subjects: [],
        },
      };
    }

    const escaped = this.escapeRegex(rawQuery);

    const [courses, tuitionClasses, tuitionSubjects] = await Promise.all([
      this.getCourseSuggestions(escaped),
      this.getTuitionClassSuggestions(escaped),
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

  private async getCourseSuggestions(escaped: string) {
    const docs = await this.courseModel
      .aggregate([
        {
          $match: {
            product_type: { $ne: 'tuition' },
            status: 'published',
            title: { $regex: escaped, $options: 'i' },
          },
        },
        {
          $addFields: {
            relevance: {
              $cond: [
                { $regexMatch: { input: "$title", regex: "^" + escaped, options: "i" } },
                2,
                1
              ]
            }
          }
        },
        { $sort: { relevance: -1, published_at: -1, created_at: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 1,
            slug: 1,
            title: 1,
            thumbnail_url: 1,
            category_main: '$category.main',
            level: 1,
          }
        }
      ])
      .exec();

    return docs.map((doc: any) => ({
      type: 'course',
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      thumbnail_url: doc.thumbnail_url || null,
      category_main: doc.category_main || null,
      level: doc.level || null,
    }));
  }

  private async getTuitionClassSuggestions(escaped: string) {
    const docs = await this.courseModel
      .aggregate([
        {
          $match: {
            product_type: 'tuition',
            status: 'published',
            title: { $regex: escaped, $options: 'i' },
          },
        },
        {
          $addFields: {
            relevance: {
              $cond: [
                { $regexMatch: { input: "$title", regex: "^" + escaped, options: "i" } },
                2,
                1
              ]
            }
          }
        },
        { $sort: { relevance: -1, published_at: -1, created_at: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 1,
            slug: 1,
            title: 1,
            class_level: '$tuition_meta.class_level',
          }
        }
      ])
      .exec();

    return docs.map((doc: any) => ({
      type: 'tuition_class',
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      class_level: doc.class_level || null,
    }));
  }

  private async getTuitionSubjectSuggestions(escaped: string) {
    const results = await this.courseModel
      .aggregate([
        {
          $match: {
            product_type: 'tuition',
            status: 'published',
            'tuition_meta.subjects.name': { $regex: escaped, $options: 'i' },
          },
        },
        { $unwind: '$tuition_meta.subjects' },
        {
          $match: {
            'tuition_meta.subjects.name': { $regex: escaped, $options: 'i' },
          },
        },
        {
          $addFields: {
            relevance: {
              $cond: [
                { $regexMatch: { input: "$tuition_meta.subjects.name", regex: "^" + escaped, options: "i" } },
                2,
                1
              ]
            }
          }
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
            relevance: 1,
          },
        },
        { $sort: { relevance: -1, subjectName: 1 } },
        { $limit: 6 },
      ])
      .exec();

    return results.map((res) => {
      const { relevance, ...data } = res;
      return {
        type: 'tuition_subject',
        ...data,
      };
    });
  }
}
