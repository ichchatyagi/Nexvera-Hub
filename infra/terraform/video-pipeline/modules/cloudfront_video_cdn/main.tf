resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "s3-video-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_public_key" "this" {
  name        = "video-signing-key"
  encoded_key = var.public_key_pem
}

resource "aws_cloudfront_key_group" "this" {
  name  = "video-key-group"
  items = [aws_cloudfront_public_key.this.id]
}

resource "aws_cloudfront_cache_policy" "hls" {
  name        = "hls-immutable"
  comment     = "Optimized for immutable HLS fragments"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_distribution" "this" {
  enabled     = true
  comment     = var.comment
  price_class = var.price_class
  tags        = var.tags

  origin {
    domain_name              = var.bucket_regional_domain_name
    origin_id                = var.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    target_origin_id       = var.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.hls.id
    trusted_key_groups     = [aws_cloudfront_key_group.this.id]
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
