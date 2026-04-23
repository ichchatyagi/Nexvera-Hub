# Log Groups with retention
resource "aws_cloudwatch_log_group" "submit_job" {
  name              = "/aws/lambda/${var.submit_job_lambda_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "job_state" {
  name              = "/aws/lambda/${var.job_state_lambda_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Lambda Alarms: submit-job
resource "aws_cloudwatch_metric_alarm" "submit_job_errors" {
  alarm_name          = "${var.submit_job_lambda_name}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Lambda errors for ${var.submit_job_lambda_name}"
  dimensions = {
    FunctionName = var.submit_job_lambda_name
  }
}

resource "aws_cloudwatch_metric_alarm" "submit_job_throttles" {
  alarm_name          = "${var.submit_job_lambda_name}-throttles"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Lambda throttles for ${var.submit_job_lambda_name}"
  dimensions = {
    FunctionName = var.submit_job_lambda_name
  }
}

# Lambda Alarms: job-state
resource "aws_cloudwatch_metric_alarm" "job_state_errors" {
  alarm_name          = "${var.job_state_lambda_name}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Lambda errors for ${var.job_state_lambda_name}"
  dimensions = {
    FunctionName = var.job_state_lambda_name
  }
}

resource "aws_cloudwatch_metric_alarm" "job_state_throttles" {
  alarm_name          = "${var.job_state_lambda_name}-throttles"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Lambda throttles for ${var.job_state_lambda_name}"
  dimensions = {
    FunctionName = var.job_state_lambda_name
  }
}

# SQS DLQ Alarm
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "${var.dlq_name}-messages-visible"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Messages visible in Dead Letter Queue ${var.dlq_name}"
  dimensions = {
    QueueName = var.dlq_name
  }
}
