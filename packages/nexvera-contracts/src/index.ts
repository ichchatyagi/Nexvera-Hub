/**
 * Video Processing Pipeline Contracts
 * Version: 1
 */

export const VIDEO_PROCESSING_JOB_VERSION = 1;

export interface VideoProcessingJob {
  version: typeof VIDEO_PROCESSING_JOB_VERSION;
  videoId: string;
  s3Key: string;
  source: 'upload' | 'live_recording';
  requestedAtUtc: string; // ISO String
}

export const VIDEO_PROCESSING_WEBHOOK_VERSION = 1;

export interface VideoProcessingWebhookPayload {
  version: typeof VIDEO_PROCESSING_WEBHOOK_VERSION;
  status: 'completed' | 'failed';
  base_key?: string;
  duration_seconds?: number;
  error?: string;
}

/**
 * Enrollment Reconciliation Contracts
 * Version: 1
 */

export const ENROLLMENT_RECONCILE_JOB_VERSION = 1;

export interface EnrollmentReconcileJob {
  version: typeof ENROLLMENT_RECONCILE_JOB_VERSION;
  userId: string;
  triggeredBy: 'payment_success' | 'manual_admin' | 'subscription_update';
  requestedAtUtc: string;
}
