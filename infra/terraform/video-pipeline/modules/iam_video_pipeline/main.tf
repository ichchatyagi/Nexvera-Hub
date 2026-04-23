data "aws_region" "current" {}

# MediaConvert job role
resource "aws_iam_role" "mediaconvert_job" {
  name = "${var.name_prefix}-mediaconvert-job"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "mediaconvert.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "mediaconvert_job_s3" {
  name = "${var.name_prefix}-mediaconvert-s3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:GetObject"]
        Effect = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}/originals/*"]
      },
      {
        Action = ["s3:PutObject"]
        Effect = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}/videos/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "mediaconvert_job_s3" {
  role       = aws_iam_role.mediaconvert_job.name
  policy_arn = aws_iam_policy.mediaconvert_job_s3.arn
}

# Lambda role: submit-job
resource "aws_iam_role" "lambda_submit_job" {
  name = "${var.name_prefix}-lambda-submit-job"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_submit_job_basic" {
  role       = aws_iam_role.lambda_submit_job.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_submit_job_custom" {
  name = "${var.name_prefix}-lambda-submit-job-custom"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Effect   = "Allow"
        Resource = [var.queue_arn]
      },
      {
        Action = [
          "mediaconvert:DescribeEndpoints",
          "mediaconvert:CreateJob"
        ]
        Effect   = "Allow"
        Resource = ["*"]
      },
      {
        Action   = "iam:PassRole"
        Effect   = "Allow"
        Resource = [aws_iam_role.mediaconvert_job.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_submit_job_custom" {
  role       = aws_iam_role.lambda_submit_job.name
  policy_arn = aws_iam_policy.lambda_submit_job_custom.arn
}

# Lambda role: job-state
resource "aws_iam_role" "lambda_job_state" {
  name = "${var.name_prefix}-lambda-job-state"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_job_state_basic" {
  role       = aws_iam_role.lambda_job_state.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_job_state_custom" {
  name = "${var.name_prefix}-lambda-job-state-custom"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "s3:ListBucket"
        Effect   = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}"]
        Condition = {
          StringLike = {
            "s3:prefix" = ["videos/*"]
          }
        }
      },
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}/videos/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_job_state_custom" {
  role       = aws_iam_role.lambda_job_state.name
  policy_arn = aws_iam_policy.lambda_job_state_custom.arn
}
