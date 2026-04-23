resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.lambda_role_arn
  handler       = "handlers/job-state.handler"
  runtime       = "nodejs20.x"
  filename      = var.artifact_path

  source_code_hash = filebase64sha256(var.artifact_path)

  timeout                        = var.timeout_seconds
  memory_size                    = var.memory_size_mb


  environment {
    variables = {
      AWS_S3_VIDEO_BUCKET             = var.s3_video_bucket
      BACKEND_BASE_URL                 = var.backend_base_url
      VIDEO_PROCESSING_WEBHOOK_SECRET = var.video_processing_webhook_secret
    }
  }

  tags = var.tags
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.mediaconvert_state.arn
}

resource "aws_cloudwatch_event_rule" "mediaconvert_state" {
  name        = "${var.function_name}-rule"
  description = "Triggers Lambda on MediaConvert job state change"

  event_pattern = jsonencode({
    source      = ["aws.mediaconvert"]
    detail-type = ["MediaConvert Job State Change"]
    detail = {
      status = ["COMPLETE", "ERROR"]
    }
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "to_lambda" {
  rule      = aws_cloudwatch_event_rule.mediaconvert_state.name
  target_id = "SendToLambda"
  arn       = aws_lambda_function.this.arn
}
