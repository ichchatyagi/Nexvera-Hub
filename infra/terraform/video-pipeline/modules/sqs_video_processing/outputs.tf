output "queue_url" {
  description = "The URL of the main SQS queue"
  value       = aws_sqs_queue.main.url
}

output "queue_arn" {
  description = "The ARN of the main SQS queue"
  value       = aws_sqs_queue.main.arn
}

output "dlq_arn" {
  description = "The ARN of the dead-letter queue"
  value       = aws_sqs_queue.dlq.arn
}

output "queue_name" {
  description = "The name of the main SQS queue"
  value       = aws_sqs_queue.main.name
}

output "dlq_name" {
  description = "The name of the dead-letter queue"
  value       = aws_sqs_queue.dlq.name
}
