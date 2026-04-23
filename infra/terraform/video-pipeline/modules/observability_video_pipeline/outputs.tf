output "submit_job_log_group_arn" {
  value = aws_cloudwatch_log_group.submit_job.arn
}

output "job_state_log_group_arn" {
  value = aws_cloudwatch_log_group.job_state.arn
}
