variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for the Lambda"
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

variable "backend_base_url" {
  description = "Base URL of the backend API"
  type        = string
}

variable "video_processing_webhook_secret" {
  description = "Secret for hashing/verifying webhooks"
  type        = string
}

variable "artifact_path" {
  description = "Path to the Lambda zip artifact"
  type        = string
}

variable "timeout_seconds" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "memory_size_mb" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 256
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
