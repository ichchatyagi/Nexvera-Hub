import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ _id: false })
export class TeacherResponse {
  @Prop()
  text: string;

  @Prop({ default: Date.now })
  responded_at: Date;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Review {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Course', index: true })
  course_id: Types.ObjectId;

  @Prop({ required: true, index: true })
  student_id: string; // UUID from PostgreSQL

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  review_text: string;

  @Prop({ default: 0 })
  helpful_votes: number;

  @Prop({ type: TeacherResponse })
  response?: TeacherResponse;

  @Prop({
    type: String,
    enum: ['published', 'hidden', 'flagged'],
    default: 'published',
  })
  status: string;

  created_at?: Date;
  updated_at?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Ensure a student can only leave one review per course
ReviewSchema.index({ course_id: 1, student_id: 1 }, { unique: true });
