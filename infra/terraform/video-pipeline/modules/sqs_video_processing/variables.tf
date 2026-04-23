variable "name_prefix" {
  description = "Prefix for naming the SQS queues"
  type        = string
}

variable "visibility_timeout_seconds" {
  description = "Visibility timeout in seconds"
  type        = number
  default     = 360
}

variable "message_retention_seconds" {
  description = "Message retention in seconds"
  type        = number
  default     = 345600
}

variable "max_receive_count" {
  description = "Max receive count for redrive policy"
  type        = number
  default     = 5
}

variable "tags" {
  description = "Tags for the SQS queues"
  type        = map(string)
  default     = {}
}
