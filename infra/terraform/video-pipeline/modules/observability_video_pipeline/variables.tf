variable "submit_job_lambda_name" {
  description = "Name of the submit-job Lambda function"
  type        = string
}

variable "job_state_lambda_name" {
  description = "Name of the job-state Lambda function"
  type        = string
}

variable "dlq_name" {
  description = "Name of the SQS Dead Letter Queue"
  type        = string
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 14
}

variable "tags" {
  description = "Tags for observability resources"
  type        = map(string)
  default     = {}
}
