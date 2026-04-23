module "video_bucket" {
  source = "./modules/s3_video_bucket"

  bucket_name          = var.video_bucket_name
  cors_allowed_origins = ["*"]
  tags                 = var.tags
}

module "video_cdn" {
  source = "./modules/cloudfront_video_cdn"

  bucket_regional_domain_name = module.video_bucket.bucket_regional_domain_name
  public_key_pem              = var.cloudfront_public_key_pem
  tags                        = var.tags
}

data "aws_iam_policy_document" "video_bucket_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.video_bucket.bucket_arn}/videos/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [module.video_cdn.distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "video_bucket" {
  bucket = module.video_bucket.bucket_name
  policy = data.aws_iam_policy_document.video_bucket_policy.json
}

module "video_processing_queue" {
  source = "./modules/sqs_video_processing"

  name_prefix = "${var.name_prefix}-processing"
  tags        = var.tags
}

module "iam_video_pipeline" {
  source = "./modules/iam_video_pipeline"

  name_prefix = var.name_prefix
  bucket_name = module.video_bucket.bucket_name
  queue_arn   = module.video_processing_queue.queue_arn
  tags        = var.tags
}

module "lambda_submit_job" {
  source = "./modules/lambda_submit_job"

  function_name         = "${var.name_prefix}-submit-job"
  lambda_role_arn       = module.iam_video_pipeline.lambda_submit_job_role_arn
  sqs_queue_arn         = module.video_processing_queue.queue_arn
  aws_region            = var.aws_region
  s3_video_bucket       = module.video_bucket.bucket_name
  mediaconvert_role_arn = module.iam_video_pipeline.mediaconvert_role_arn

  # leave empty to use default MediaConvert queue
  mediaconvert_queue_arn = ""

  artifact_path = var.submit_job_artifact_path
  tags          = var.tags
}

module "lambda_job_state" {
  source = "./modules/lambda_job_state"

  function_name                   = "${var.name_prefix}-job-state"
  lambda_role_arn                 = module.iam_video_pipeline.lambda_job_state_role_arn
  aws_region                      = var.aws_region
  s3_video_bucket                 = module.video_bucket.bucket_name
  backend_base_url                = var.backend_base_url
  video_processing_webhook_secret = var.video_processing_webhook_secret
  artifact_path                   = var.job_state_artifact_path
  tags                            = var.tags
}

module "iam_backend_video_client" {
  source = "./modules/iam_backend_video_client"

  name_prefix = var.name_prefix
  bucket_name = module.video_bucket.bucket_name
  queue_arn   = module.video_processing_queue.queue_arn
  tags        = var.tags
}

module "observability_video_pipeline" {
  source = "./modules/observability_video_pipeline"

  submit_job_lambda_name = module.lambda_submit_job.lambda_function_name
  job_state_lambda_name  = module.lambda_job_state.lambda_function_name
  dlq_name               = module.video_processing_queue.dlq_name
  log_retention_days     = var.log_retention_days
  tags                   = var.tags
}
