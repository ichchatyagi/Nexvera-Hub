import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
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
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_TLS: Joi.boolean().default(false),
  REDIS_REQUIRED: Joi.boolean()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false),
    }),

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

  // AWS / Video Pipeline Additional
  AWS_REGION: Joi.string().optional(),
  AWS_DEFAULT_REGION: Joi.string().optional(),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_ACCESS_KEY: Joi.string().optional(),
  AWS_SECRET_KEY: Joi.string().optional(),
  AWS_SQS_VIDEO_QUEUE_URL: Joi.string().optional(),
  VIDEO_PROCESSING_WEBHOOK_SECRET: Joi.string().required(),

  // Agora Cloud Recording & Tokens
  AGORA_CUSTOMER_ID: Joi.string().optional(),
  AGORA_CUSTOMER_CERTIFICATE: Joi.string().optional(),
  AGORA_TOKEN_TTL_SECONDS: Joi.number().optional(),

  // Agora Whiteboard
  USE_AGORA_WHITEBOARD: Joi.string().valid('true', 'false').default('false'),
  AGORA_WHITEBOARD_APP_ID: Joi.string().optional(),
  AGORA_WHITEBOARD_APP_SECRET: Joi.string().optional(),
  AGORA_WHITEBOARD_TOKEN_TTL_SECONDS: Joi.number().optional(),
  AGORA_WHITEBOARD_REGION: Joi.string()
    .valid('cn-hz', 'us-sv', 'sg', 'in-mum', 'gb-lon')
    .default('cn-hz'),

  // CloudFront signed URL configuration
  CLOUDFRONT_SIGNED_URLS_ENABLED: Joi.boolean().when('NODE_ENV', {
    is: 'production',
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  CLOUDFRONT_KEY_PAIR_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.when('CLOUDFRONT_SIGNED_URLS_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    otherwise: Joi.optional(),
  }),
  CLOUDFRONT_PRIVATE_KEY_BASE64: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.when('CLOUDFRONT_SIGNED_URLS_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    otherwise: Joi.optional(),
  }),
  CLOUDFRONT_SIGNED_URL_TTL_SECONDS: Joi.number().default(600),
  // Cache configuration
  CACHE_ENABLED: Joi.boolean()
    .when('NODE_ENV', { is: 'production', then: Joi.boolean().default(true) })
    .when('NODE_ENV', { is: 'test', then: Joi.boolean().default(false) })
    .default(false),
  CACHE_DEFAULT_TTL_SECONDS: Joi.number().default(60),

  VIDEO_UPLOADS_ENABLED: Joi.boolean().when('NODE_ENV', {
    is: 'production',
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  VIDEO_PROCESSING_QUEUE_ENABLED: Joi.boolean().when('NODE_ENV', {
    is: 'production',
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
});
