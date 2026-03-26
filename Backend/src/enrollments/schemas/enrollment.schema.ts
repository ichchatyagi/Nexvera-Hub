import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ _id: false })
export class EnrollmentProgress {
  @Prop({ default: 0 })
  percentage: number;

  @Prop({ type: [{ type: Types.ObjectId }] })
  completed_lessons: Types.ObjectId[];

  @Prop({ type: Types.ObjectId })
  current_lesson?: Types.ObjectId;

  @Prop({ default: Date.now })
  last_accessed: Date;
}

@Schema({ _id: false })
export class WatchHistoryItem {
  @Prop({ type: Types.ObjectId, required: true })
  lesson_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  video_id?: Types.ObjectId;

  @Prop({ default: 0 })
  watch_time_seconds: number;

  @Prop({ default: 0 })
  progress_percentage: number;

  @Prop({ default: 0 })
  last_position_seconds: number;

  @Prop({ default: Date.now })
  updated_at: Date;
}

@Schema({ _id: false })
export class CertificateInfo {
  @Prop({ default: false })
  issued: boolean;

  @Prop()
  issued_at?: Date;

  @Prop()
  certificate_id?: string;

  @Prop()
  certificate_url?: string;
}

@Schema({ timestamps: { createdAt: 'enrolled_at', updatedAt: 'updated_at' } })
export class Enrollment {
  @Prop({ required: true, index: true })
  student_id: string; // UUID from PostgreSQL User

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course', index: true })
  course_id: Types.ObjectId;

  @Prop()
  transaction_id?: string; // UUID or stripe intent ID

  @Prop({ type: EnrollmentProgress, default: () => ({}) })
  progress: EnrollmentProgress;

  @Prop({ type: [SchemaFactory.createForClass(WatchHistoryItem)] })
  watch_history: WatchHistoryItem[];

  @Prop({ type: CertificateInfo })
  certificate?: CertificateInfo;

  @Prop()
  access_expires?: Date;

  @Prop({ type: String, enum: ['active', 'expired', 'refunded'], default: 'active' })
  status: string;

  enrolled_at?: Date;
  updated_at?: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Ensure a student can only enroll in a course once
EnrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
