output "video_bucket_name" {
  description = "The name of the video storage bucket"
  value       = module.video_bucket.bucket_name
}

output "video_bucket_regional_domain_name" {
  description = "The regional domain name of the video storage bucket"
  value       = module.video_bucket.bucket_regional_domain_name
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.video_cdn.domain_name
}

output "cloudfront_key_pair_id" {
  description = "The ID of the CloudFront public key"
  value       = module.video_cdn.public_key_id
}

output "video_processing_queue_url" {
  description = "The URL of the video processing SQS queue"
  value       = module.video_processing_queue.queue_url
}

output "video_processing_queue_arn" {
  description = "The ARN of the video processing SQS queue"
  value       = module.video_processing_queue.queue_arn
}

output "video_processing_dlq_arn" {
  description = "The ARN of the video processing dead-letter queue"
  value       = module.video_processing_queue.dlq_arn
}

output "mediaconvert_role_arn" {
  description = "The ARN of the IAM role for MediaConvert jobs"
  value       = module.iam_video_pipeline.mediaconvert_role_arn
}

output "lambda_submit_job_role_arn" {
  description = "The ARN of the IAM role for the submit-job Lambda"
  value       = module.iam_video_pipeline.lambda_submit_job_role_arn
}

output "lambda_job_state_role_arn" {
  description = "The ARN of the IAM role for the job-state Lambda"
  value       = module.iam_video_pipeline.lambda_job_state_role_arn
}

output "submit_job_lambda_name" {
  description = "The name of the submit-job Lambda function"
  value       = module.lambda_submit_job.lambda_function_name
}

output "job_state_lambda_name" {
  description = "The name of the job-state Lambda function"
  value       = module.lambda_job_state.lambda_function_name
}

output "mediaconvert_event_rule_arn" {
  description = "The ARN of the EventBridge rule for MediaConvert jobs"
  value       = module.lambda_job_state.event_rule_arn
}

output "backend_video_access_key_id" {
  description = "The access key ID for the backend IAM user"
  value       = module.iam_backend_video_client.access_key_id
  sensitive   = true
}

output "backend_video_secret_access_key" {
  description = "The secret access key for the backend IAM user"
  value       = module.iam_backend_video_client.secret_access_key
  sensitive   = true
}
