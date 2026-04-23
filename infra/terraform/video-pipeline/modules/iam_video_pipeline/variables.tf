variable "name_prefix" {
  description = "Prefix for naming the IAM roles and policies"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket for video storage"
  type        = string
}

variable "queue_arn" {
  description = "ARN of the SQS queue for video processing"
  type        = string
}

variable "tags" {
  description = "Tags for the IAM resources"
  type        = map(string)
  default     = {}
}
