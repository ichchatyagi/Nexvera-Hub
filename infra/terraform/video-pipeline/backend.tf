terraform {
  backend "s3" {
    bucket         = "nexvera-tfstate-us-east-1-prod-infra"
    key            = "video-pipeline/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks-nexvera-video-prod"
    encrypt        = true
  }
}
