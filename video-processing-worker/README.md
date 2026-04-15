# Nexvera Video Processing Worker

This package contains AWS Lambda handlers for the video processing pipeline.

## Handlers

### 1. `submit-job` (SQS Triggered)
Triggered by messages in the `AWS_SQS_VIDEO_QUEUE_URL`.
- **Logic**: Submits a MediaConvert job to transcode the original video into an HLS ladder (360p, 480p, 720p, 1080p) and generate thumbnails.
- **Entry Point**: `dist/handlers/submit-job.handler`

### 2. `job-state` (EventBridge Triggered)
Triggered by "MediaConvert Job State Change" events.
- **Logic**: Notifies the Nexvera Backend of job completion or failure via a secured webhook.
- **Entry Point**: `dist/handlers/job-state.handler`

## Environment Variables

| Variable | Required By | Description |
|----------|-------------|-------------|
| `AWS_REGION` | Both | AWS region (e.g., `us-east-1`). |
| `AWS_S3_VIDEO_BUCKET` | `submit-job` | S3 bucket containing original and processed videos. |
| `AWS_MEDIACONVERT_ROLE_ARN` | `submit-job` | IAM role ARN for MediaConvert to access S3. |
| `AWS_MEDIACONVERT_QUEUE_ARN` | `submit-job` | (Optional) MediaConvert queue ARN. |
| `BACKEND_BASE_URL` | `job-state` | Base URL of the Nexvera Backend (e.g., `https://api.nexvera.com`). |
| `VIDEO_PROCESSING_WEBHOOK_SECRET` | `job-state` | Secret key for `x-internal-video-secret` header. |

## Deployment Notes
1. Run `npm install` and `npm run build`.
2. Zip the `dist/` and `node_modules/` directories for each Lambda.
3. Configure the triggers in AWS Console/Terraform:
   - `submit-job`: SQS Queue trigger.
   - `job-state`: EventBridge rule for MediaConvert Job State Change.
