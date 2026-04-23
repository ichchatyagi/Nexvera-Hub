resource "aws_iam_user" "backend_video" {
  name = "${var.name_prefix}-backend-video"
  tags = var.tags
}

resource "aws_iam_policy" "backend_video_policy" {
  name = "${var.name_prefix}-backend-video-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts"
        ]
        Effect   = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}/originals/*"]
      },
      {
        Action   = "s3:ListBucketMultipartUploads"
        Effect   = "Allow"
        Resource = ["arn:aws:s3:::${var.bucket_name}"]
      },
      {
        Action   = "sqs:SendMessage"
        Effect   = "Allow"
        Resource = [var.queue_arn]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "backend_video" {
  user       = aws_iam_user.backend_video.name
  policy_arn = aws_iam_policy.backend_video_policy.arn
}

resource "aws_iam_access_key" "backend_video" {
  user = aws_iam_user.backend_video.name
}
