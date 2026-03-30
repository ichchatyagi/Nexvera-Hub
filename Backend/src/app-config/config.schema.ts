import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  CORS_ORIGINS: Joi.string().default('*'),
  
  // Database configs
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  
  MONGODB_URI: Joi.string().required(),
  
  // Redis configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  
  // Other credentials
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
  STRIPE_SECRET_KEY: Joi.string().optional(),
  AGORA_APP_ID: Joi.string().optional(),
  AGORA_APP_CERTIFICATE: Joi.string().optional(),
  AWS_S3_BUCKET: Joi.string().optional(),

  // Video pipeline – S3 raw upload bucket (may differ from generic AWS_S3_BUCKET)
  // See IMPLEMENTATION_PLAN_PART3.md §7 – Step 1: Upload
  AWS_S3_VIDEO_BUCKET: Joi.string().optional(),

  // CloudFront distribution domain for serving processed HLS + thumbnails
  // See IMPLEMENTATION_PLAN_PART3.md §7 – Step 5: CDN Distribution
  // Format: d1234abcde.cloudfront.net  (no https:// prefix)
  CLOUDFRONT_VIDEO_DOMAIN: Joi.string().optional(),

  // Razorpay configuration
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),
  
  // Email configuration
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  SENDER_EMAIL: Joi.string().required(),
  SENDER_PASS: Joi.string().required(),
  RECIPIENT_EMAIL: Joi.string().required(),
});
