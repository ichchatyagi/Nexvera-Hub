variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "nexvera"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "name_prefix" {
  description = "Prefix for naming resources"
  type        = string
  default     = "nexvera-video-prod"
}

variable "tags" {
  description = "Standard tags for all resources"
  type        = map(string)
  default = {
    Project     = "nexvera"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

variable "tf_state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "nexvera-tfstate-us-east-1-prod-infra"
}

variable "tf_lock_table_name" {
  description = "Name of the DynamoDB table for Terraform locks"
  type        = string
  default     = "terraform-locks-nexvera-video-prod"
}

variable "video_bucket_name" {
  description = "Globally unique name for the video storage bucket"
  type        = string
}

variable "cloudfront_public_key_pem" {
  description = "CloudFront public key (PEM) for signed URLs"
  type        = string
}

variable "submit_job_artifact_path" {
  description = "Local path to the submit-job Lambda zip artifact"
  type        = string
}

variable "job_state_artifact_path" {
  description = "Local path to the job-state Lambda zip artifact"
  type        = string
}

variable "backend_base_url" {
  description = "Base URL of the backend API for webhooks"
  type        = string
}

variable "video_processing_webhook_secret" {
  description = "Secret for hashing/verifying video processing webhooks"
  type        = string
  sensitive   = true
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 14
}
