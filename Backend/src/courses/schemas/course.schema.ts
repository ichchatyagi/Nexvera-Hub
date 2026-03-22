/**
 * NOTE: This is a minimal example model.
 * It will be expanded to match `implementation-plans/IMPLEMENTATION_PLAN_PART2.md` in later modules.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  teacherId: string; // The UUID from PostgreSQL User

  @Prop({ default: 0 })
  price: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
