import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LiveClassDocument = LiveClass & Document;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** Agora channel configuration for this live class session. */
@Schema({ _id: false })
export class LiveClassAgora {
  /**
   * Unique Agora channel name for this class.
   * Generated at creation time (e.g. "nexvera-<uuid>").
   */
  @Prop({ required: true })
  channel_name: string;

  /**
   * UID reserved for the Cloud Recording bot.
   * Optional – populated when Agora Cloud Recording is started.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §8 – Cloud Recording Setup):
   *   Populate this field when calling Agora Cloud Recording REST API
   *   /v1/apps/{appid}/cloud_recording/acquire  (returns the cloud recording UID).
   */
  @Prop({ type: String, default: null })
  recording_uid: string | null;
}

/** Recording state and reference for a live class. */
@Schema({ _id: false })
export class LiveClassRecording {
  /** Whether cloud recording was requested for this session. */
  @Prop({ default: false })
  enabled: boolean;

  /**
   * MongoDB ObjectId of the Video document created after the recording
   * has been processed through the video pipeline.
   * Null until recording is complete and transcoded.
   *
   * TODO: Wire to the Videos module once Agora Cloud Recording is integrated.
   */
  @Prop({ type: Types.ObjectId, default: null })
  video_id: Types.ObjectId | null;

  /**
   * Lifecycle state of the recording artifact.
   * pending    → recording enabled but not yet started / available
   * processing → Agora delivered the file; MediaConvert job running
   * available  → Video is ready for playback
   */
  @Prop({
    type: String,
    enum: ['pending', 'processing', 'available'],
    default: 'pending',
  })
  status: string;
}

/**
 * Feature flags controlling real-time capabilities of the live class.
 * All flags default to false; teacher enables them at creation/update time.
 *
 * TODO (IMPLEMENTATION_PLAN_PART3.md §8 – Real-time Architecture):
 *   Each flag acts as a gating condition within the future LiveClassesGateway:
 *   - chat_enabled     → enable/disable the chat namespace
 *   - qa_enabled       → enable/disable the Q&A namespace
 *   - screen_share_enabled → surface screen-share controls in the Agora client
 *   - whiteboard_enabled   → mount the collaborative whiteboard component
 */
@Schema({ _id: false })
export class LiveClassFeatures {
  @Prop({ default: false })
  chat_enabled: boolean;

  @Prop({ default: false })
  qa_enabled: boolean;

  @Prop({ default: false })
  screen_share_enabled: boolean;

  @Prop({ default: false })
  whiteboard_enabled: boolean;
}

// ─── Root document ────────────────────────────────────────────────────────────

/** Status values and their valid transitions:
 *  scheduled → live   (teacher calls POST /live-classes/:id/start)
 *  live      → ended  (teacher calls POST /live-classes/:id/end)
 *  scheduled → cancelled (teacher calls POST /live-classes/:id/cancel)
 *  ⚠ Cannot start a cancelled or ended class.
 */
export enum LiveClassStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class LiveClass {
  /**
   * MongoDB ObjectId of the course this live class belongs to.
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  course_id: Types.ObjectId;

  /**
   * MongoDB ObjectId of the specific curriculum lesson that references
   * this live class (curriculum.sections[].lessons[].content.live_class_id).
   * Optional – teacher may not link it to a lesson immediately.
   */
  @Prop({ type: Types.ObjectId, default: null })
  lesson_id: Types.ObjectId | null;

  /**
   * UUID of the owning teacher (PostgreSQL users.id).
   * Used for ownership checks and listing a teacher's classes.
   */
  @Prop({ required: true, index: true })
  teacher_id: string;

  // ── Metadata ──────────────────────────────────────────────────────────────

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: null })
  description: string | null;

  // ── Scheduling ────────────────────────────────────────────────────────────

  @Prop({ required: true })
  scheduled_start: Date;

  @Prop({ required: true })
  scheduled_end: Date;

  /**
   * IANA timezone identifier, e.g. "Asia/Kolkata", "America/New_York".
   * Stored for display purposes; scheduling logic is always UTC internally.
   */
  @Prop({ required: true })
  timezone: string;

  // ── Agora config ──────────────────────────────────────────────────────────

  @Prop({ type: LiveClassAgora, required: true })
  agora: LiveClassAgora;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(LiveClassStatus),
    default: LiveClassStatus.SCHEDULED,
    index: true,
  })
  status: LiveClassStatus;

  /** Actual time the teacher clicked "Start" (set by POST /live-classes/:id/start). */
  @Prop({ type: Date, default: null })
  actual_start: Date | null;

  /** Actual time the teacher clicked "End" (set by POST /live-classes/:id/end). */
  @Prop({ type: Date, default: null })
  actual_end: Date | null;

  // ── Participants ──────────────────────────────────────────────────────────

  /** Hard cap on simultaneous participants (default 100). */
  @Prop({ default: 100 })
  max_participants: number;

  /**
   * UUIDs of students (PostgreSQL users.id) who have registered.
   * Enforced against max_participants at registration time.
   */
  @Prop({ type: [String], default: [] })
  registered_students: string[];

  /**
   * UUIDs of students who actually joined (called POST /live-classes/:id/join).
   * Populated at join time; may be smaller than registered_students.
   */
  @Prop({ type: [String], default: [] })
  attended_students: string[];

  // ── Recording ─────────────────────────────────────────────────────────────

  @Prop({ type: LiveClassRecording, default: () => ({}) })
  recording: LiveClassRecording;

  // ── Feature flags ─────────────────────────────────────────────────────────

  @Prop({ type: LiveClassFeatures, default: () => ({}) })
  features: LiveClassFeatures;

  // Injected by timestamps option:
  created_at?: Date;
  updated_at?: Date;
}

export const LiveClassSchema = SchemaFactory.createForClass(LiveClass);

// ── Indexes ───────────────────────────────────────────────────────────────────
// For teacher dashboard: list my classes by status quickly
LiveClassSchema.index({ teacher_id: 1, status: 1 });
// For sorting upcoming classes (used in course page listing)
LiveClassSchema.index({ scheduled_start: 1 });
// For fetching all classes inside a course (student course page)
LiveClassSchema.index({ course_id: 1, scheduled_start: 1 });
