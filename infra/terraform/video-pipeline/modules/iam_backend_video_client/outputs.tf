output "access_key_id" {
  value     = aws_iam_access_key.backend_video.id
  sensitive = true
}

output "secret_access_key" {
  value     = aws_iam_access_key.backend_video.secret
  sensitive = true
}

output "user_name" {
  value = aws_iam_user.backend_video.name
}
