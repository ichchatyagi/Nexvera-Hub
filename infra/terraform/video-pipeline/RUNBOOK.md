# Video Pipeline Infrastructure Runbook

This guide covers building, deploying, and verifying the video processing pipeline.

## 1. Build Artifacts

The Lambda functions share a common codebase in `video-processing-worker`.

1. Navigate to the worker directory:
   ```bash
   cd video-processing-worker
   npm ci
   npm run build
   ```
2. Create Lambda zip artifacts (must include `dist/` and production `node_modules/`):
   ```bash
   # From video-processing-worker
   zip -r ../infra/terraform/video-pipeline/artifacts/submit-job.zip dist node_modules
   zip -r ../infra/terraform/video-pipeline/artifacts/job-state.zip dist node_modules
   ```

## 2. Terraform Deployment

### Bootstrap Remote State
1. Navigate to bootstrap directory:
   ```bash
   cd infra/terraform/bootstrap-state
   ```
2. Initialize and apply:
   ```bash
   terraform init
   terraform apply
   ```

### Deploy Video Pipeline
1. Navigate to pipeline directory:
   ```bash
   cd infra/terraform/video-pipeline
   ```
2. Create your production variables file:
   ```bash
   cp prod.tfvars.example prod.tfvars
   ```
3. Edit `prod.tfvars` with real values (bucket names, public key, etc.).
4. Initialize and apply:
   ```bash
   terraform init
   terraform apply -var-file=prod.tfvars
   ```

## 3. Map Terraform Outputs to Backend Environment

Initialize your backend `.env` with these values from the Terraform outputs:

| Environment Variable | Terraform Source |
| :--- | :--- |
| `AWS_REGION` | `us-east-1` |
| `AWS_S3_VIDEO_BUCKET` | Output `video_bucket_name` |
| `AWS_SQS_VIDEO_QUEUE_URL` | Output `video_processing_queue_url` |
| `VIDEO_PROCESSING_WEBHOOK_SECRET`| Same as Terraform var `video_processing_webhook_secret` |
| `CLOUDFRONT_VIDEO_DOMAIN` | Output `cloudfront_domain_name` |
| `CLOUDFRONT_SIGNED_URLS_ENABLED` | `true` |
| `CLOUDFRONT_KEY_PAIR_ID` | Output `cloudfront_key_pair_id` |
| `CLOUDFRONT_PRIVATE_KEY_BASE64` | Base64 of `cf_private_key.pem` |
| `VIDEO_UPLOADS_ENABLED` | `true` |
| `VIDEO_PROCESSING_QUEUE_ENABLED` | `true` |

> [!IMPORTANT]
> CloudFront **requires signed URLs** (trusted key groups are enabled). Playback will return 403 Forbidden unless URL signing is configured in the backend.

## 4. End-to-End Verification

1. **Upload**: Call backend `POST /videos/upload-url`, get presigned URL, and upload a file.
2. **Process**: Trigger processing via `POST /videos/:id/process`.
3. **Monitor**:
   - Check `submit-job` Lambda logs in CloudWatch: Verify job creation.
   - Check S3: Verify transcoded outputs appear in `videos/<id>/`.
   - Check `job-state` Lambda logs: Verify webhook delivery and thumbnail normalization.
4. **Playback**: Call backend playback endpoint and verify the CloudFront URL loads correctly.
