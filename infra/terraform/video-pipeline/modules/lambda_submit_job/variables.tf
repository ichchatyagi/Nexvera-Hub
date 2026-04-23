variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for the Lambda"
  type        = string
}

variable "sqs_queue_arn" {
  description = "ARN of the SQS queue to trigger the Lambda"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "s3_video_bucket" {
  description = "Name of the S3 bucket for video assets"
  type        = string
}

variable "mediaconvert_role_arn" {
  description = "ARN of the MediaConvert role"
  type        = string
}

variable "mediaconvert_queue_arn" {
  description = "ARN of the MediaConvert queue (optional)"
  type        = string
  default     = ""
}

variable "artifact_path" {
  description = "Path to the Lambda zip artifact"
  type        = string
}

variable "timeout_seconds" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 120
}

variable "memory_size_mb" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

variable "reserved_concurrency" {
  description = "Reserved concurrency for the Lambda"
  type        = number
  default     = 2
}

variable "tags" {
  description = "Tags for the Lambda function"
  type        = map(string)
  default     = {}
}
