output "mediaconvert_role_arn" {
  value = aws_iam_role.mediaconvert_job.arn
}

output "lambda_submit_job_role_arn" {
  value = aws_iam_role.lambda_submit_job.arn
}

output "lambda_job_state_role_arn" {
  value = aws_iam_role.lambda_job_state.arn
}
