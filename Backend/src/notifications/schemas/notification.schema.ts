import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationType {
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ENROLLMENT_GRANTED = 'enrollment_granted',
  LIVE_CLASS_STARTED = 'live_class_started',
  LIVE_CLASS_ENDED = 'live_class_ended',
  LIVE_CLASS_RECORDING_AVAILABLE = 'live_class_recording_available',
}

@Schema({
  collection: 'notifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Notification {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, index: true, enum: Object.values(NotificationType) })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ type: Date, default: null, index: true })
  read_at: Date | null;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Add Compound Indexes
NotificationSchema.index({ user_id: 1, read_at: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, created_at: -1 });
