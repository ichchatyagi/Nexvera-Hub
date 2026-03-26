import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ _id: false })
export class CourseCategory {
  @Prop()
  main: string;

  @Prop()
  sub: string;

  @Prop([String])
  tags: string[];
}

@Schema({ _id: false })
export class CourseDiscount {
  @Prop()
  percentage: number;

  @Prop()
  valid_until: Date;
}

@Schema({ _id: false })
export class CoursePricing {
  @Prop({ type: String, enum: ['free', 'paid', 'subscription'], default: 'paid' })
  type: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ type: CourseDiscount })
  discount?: CourseDiscount;
}

@Schema({ _id: false })
export class LessonContent {
  @Prop({ type: Types.ObjectId })
  video_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  live_class_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  quiz_id?: Types.ObjectId;

  @Prop()
  resource_url?: string;
}

@Schema()
export class Lesson {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  lesson_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: ['video', 'live_class', 'quiz', 'assignment', 'resource'] })
  type: string;

  @Prop()
  duration_minutes?: number;

  @Prop({ default: false })
  is_preview: boolean;

  @Prop({ required: true })
  order: number;

  @Prop({ type: LessonContent })
  content?: LessonContent;
}

@Schema()
export class CurriculumSection {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  section_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: [SchemaFactory.createForClass(Lesson)] })
  lessons: Lesson[];
}

@Schema({ _id: false })
export class CourseStats {
  @Prop({ default: 0 })
  enrollments: number;

  @Prop({ default: 0 })
  completions: number;

  @Prop({ default: 0 })
  average_rating: number;

  @Prop({ default: 0 })
  total_reviews: number;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  short_description: string;

  @Prop({ required: true, index: true })
  teacher_id: string; // The UUID from PostgreSQL User

  @Prop({ type: CourseCategory })
  category: CourseCategory;

  @Prop({ type: CoursePricing })
  pricing: CoursePricing;

  @Prop({ type: [SchemaFactory.createForClass(CurriculumSection)] })
  curriculum: CurriculumSection[];

  @Prop()
  thumbnail_url: string;

  @Prop()
  preview_video_url: string;

  @Prop()
  language: string;

  @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'] })
  level: string;

  @Prop({ default: 0 })
  total_duration_hours: number;

  @Prop({ default: 0 })
  total_lessons: number;

  @Prop({ type: CourseStats, default: () => ({}) })
  stats: CourseStats;

  @Prop({ type: String, enum: ['draft', 'pending_review', 'published', 'archived'], default: 'draft' })
  status: string;

  @Prop()
  published_at: Date;

  @Prop([String])
  requirements: string[];

  @Prop([String])
  outcomes: string[];

  @Prop([String])
  target_audience: string[];

  created_at?: Date;
  updated_at?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ 'category.main': 1, 'category.sub': 1 });
CourseSchema.index({ 'status': 1, 'published_at': -1 });
CourseSchema.index({ 'stats.average_rating': -1 });
// CourseSchema.index({ '$**': 'text' }); // We can wait for later module for search
