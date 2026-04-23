# Nexvera Video Pipeline Infrastructure

This directory contains the Terraform configuration for the video processing pipeline.

## Prerequisites

Before initializing this infrastructure, you must have the remote state backend resources (S3 bucket and DynamoDB table) created. 

1. Navigate to `infra/terraform/bootstrap-state/`
2. Run `terraform init`
3. Run `terraform apply`
4. Note the output values for the bucket name and lock table.

## Usage

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Plan the infrastructure:
   ```bash
   terraform plan
   ```

3. Apply the changes:
   ```bash
   terraform apply
   ```

## Configuration

- **Region**: `us-east-1` (default)
- **Backend**: S3 + DynamoDB lock
