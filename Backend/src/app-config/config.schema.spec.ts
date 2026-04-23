import * as Joi from 'joi';
import { configValidationSchema } from './config.schema';

describe('Config Schema Validation', () => {
  const baseConfig = {
    POSTGRES_HOST: 'localhost',
    POSTGRES_USER: 'user',
    POSTGRES_PASSWORD: 'password',
    POSTGRES_DB: 'db',
    MONGODB_URI: 'mongodb://localhost:27017/nexvera',
    JWT_SECRET: 'secret',
    RAZORPAY_KEY_ID: 'key',
    RAZORPAY_KEY_SECRET: 'secret',
    RAZORPAY_WEBHOOK_SECRET: 'secret',
    EMAIL_USER: 'user',
    EMAIL_PASS: 'pass',
    SENDER_EMAIL: 'sender',
    SENDER_PASS: 'pass',
    RECIPIENT_EMAIL: 'recipient',
    VIDEO_PROCESSING_WEBHOOK_SECRET: 'secret',
  };

  it('validates a valid minimal production config with signing disabled', () => {
    const config = {
      ...baseConfig,
      NODE_ENV: 'production',
      CLOUDFRONT_SIGNED_URLS_ENABLED: false,
    };
    const { error } = configValidationSchema.validate(config);
    expect(error).toBeUndefined();
  });

  it('fails production config if signing enabled but keypair missing', () => {
    const config = {
      ...baseConfig,
      NODE_ENV: 'production',
      CLOUDFRONT_SIGNED_URLS_ENABLED: true,
      // CLOUDFRONT_KEY_PAIR_ID is missing
    };
    const { error } = configValidationSchema.validate(config);
    expect(error).toBeDefined();
    expect(error?.message).toContain('CLOUDFRONT_KEY_PAIR_ID');
  });

  it('validates production config if signing enabled and keypair present', () => {
    const config = {
      ...baseConfig,
      NODE_ENV: 'production',
      CLOUDFRONT_SIGNED_URLS_ENABLED: true,
      CLOUDFRONT_KEY_PAIR_ID: 'K123456789',
      CLOUDFRONT_PRIVATE_KEY_BASE64: 'base64-encoded-key',
    };
    const { error } = configValidationSchema.validate(config);
    expect(error).toBeUndefined();
  });

  it('validates development config even if signing enabled but keypair missing', () => {
    const config = {
      ...baseConfig,
      NODE_ENV: 'development',
      CLOUDFRONT_SIGNED_URLS_ENABLED: true,
      // CLOUDFRONT_KEY_PAIR_ID missing but optional in dev
    };
    const { error } = configValidationSchema.validate(config);
    expect(error).toBeUndefined();
  });
});
