variable "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "origin_id" {
  description = "Origin ID for CloudFront"
  type        = string
  default     = "s3-video-origin"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "comment" {
  description = "Comment for the CloudFront distribution"
  type        = string
  default     = "Nexvera video CDN"
}

variable "public_key_pem" {
  description = "CloudFront public key (PEM)"
  type        = string
}

variable "tags" {
  description = "Tags for the CloudFront distribution"
  type        = map(string)
  default     = {}
}
