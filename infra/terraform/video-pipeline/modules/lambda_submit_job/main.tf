resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.lambda_role_arn
  handler       = "handlers/submit-job.handler"
  runtime       = "nodejs20.x"
  filename      = var.artifact_path

  # Note: source_code_hash is used to trigger updates when the file changes
  source_code_hash = filebase64sha256(var.artifact_path)

  timeout                        = var.timeout_seconds
  memory_size                    = var.memory_size_mb


  environment {
    variables = {
      AWS_S3_VIDEO_BUCKET        = var.s3_video_bucket
      AWS_MEDIACONVERT_ROLE_ARN  = var.mediaconvert_role_arn
      AWS_MEDIACONVERT_QUEUE_ARN = var.mediaconvert_queue_arn
    }
  }

  tags = var.tags
}

resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = var.sqs_queue_arn
  function_name    = aws_lambda_function.this.arn
  batch_size       = 1
  enabled          = true
}
