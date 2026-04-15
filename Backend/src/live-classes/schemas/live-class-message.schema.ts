import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LiveClassMessageDocument = LiveClassMessage & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class LiveClassMessage {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  live_class_id: Types.ObjectId;

  @Prop({ required: true })
  user_id: string; // UUID from Postgres users.id

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ type: String, default: null })
  user_name: string | null;

  @Prop({ type: String, default: null })
  user_role: string | null; // 'student' | 'teacher' | 'admin'

  // created_at injected by timestamps option
  created_at?: Date;
}

export const LiveClassMessageSchema =
  SchemaFactory.createForClass(LiveClassMessage);

LiveClassMessageSchema.index({ live_class_id: 1, created_at: -1 });
