import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get environment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 5000;
  }

  // Postgres Database config
  get postgresHost(): string {
    return this.configService.get<string>('POSTGRES_HOST') || '';
  }

  get postgresPort(): number {
    return this.configService.get<number>('POSTGRES_PORT') || 5432;
  }

  get postgresUser(): string {
    return this.configService.get<string>('POSTGRES_USER') || '';
  }

  get postgresPassword(): string {
    return this.configService.get<string>('POSTGRES_PASSWORD') || '';
  }

  get postgresDb(): string {
    return this.configService.get<string>('POSTGRES_DB') || '';
  }

  // MongoDB config
  get mongoUri(): string {
    return this.configService.get<string>('MONGODB_URI') || '';
  }

  // JWT Config
  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || '';
  }

  get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION') || '1d';
  }

  // Redis Config
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || 'localhost';
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT') || 6379;
  }

  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD') || '';
  }

  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB') || 0;
  }

  get redisTls(): boolean {
    return this.configService.get<boolean>('REDIS_TLS') || false;
  }

  get redisRequired(): boolean {
    return this.configService.get<boolean>('REDIS_REQUIRED') || false;
  }

  // Stripe Config
  get stripeSecretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY') || '';
  }

  // Agora Config
  get agoraAppId(): string {
    return this.configService.get<string>('AGORA_APP_ID') || '';
  }

  get agoraAppCertificate(): string {
    return this.configService.get<string>('AGORA_APP_CERTIFICATE') || '';
  }

  get agoraCustomerId(): string {
    return this.configService.get<string>('AGORA_CUSTOMER_ID') || '';
  }

  get agoraCustomerCertificate(): string {
    return this.configService.get<string>('AGORA_CUSTOMER_CERTIFICATE') || '';
  }

  // AWS S3 Config
  get awsS3Bucket(): string {
    return this.configService.get<string>('AWS_S3_BUCKET') || '';
  }

  /** Dedicated S3 bucket for raw video uploads. Falls back to awsS3Bucket. */
  get awsS3VideoBucket(): string {
    return (
      this.configService.get<string>('AWS_S3_VIDEO_BUCKET') ||
      this.awsS3Bucket ||
      ''
    );
  }

  /**
   * CloudFront distribution hostname for video delivery (HLS + thumbnails).
   * Format: d1234abcde.cloudfront.net  (no https:// prefix).
   *
   * See IMPLEMENTATION_PLAN_PART3.md §7 – Step 5: CDN Distribution.
   */
  get cloudfrontVideoDomain(): string {
    return this.configService.get<string>('CLOUDFRONT_VIDEO_DOMAIN') || '';
  }

  // CORS Config
  get corsOrigins(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGINS') || '*';
    if (origins === '*') {
      return ['*'];
    }
    return origins.split(',').map((origin) => origin.trim());
  }

  // Razorpay Config
  get razorpayKeyId(): string {
    return this.configService.get<string>('RAZORPAY_KEY_ID') || '';
  }

  get razorpayKeySecret(): string {
    return this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
  }

  get razorpayWebhookSecret(): string {
    return this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
  }

  // Email Config
  get emailUser(): string {
    return this.configService.get<string>('EMAIL_USER') || '';
  }

  get emailPass(): string {
    return this.configService.get<string>('EMAIL_PASS') || '';
  }

  get senderEmail(): string {
    return this.configService.get<string>('SENDER_EMAIL') || '';
  }

  get senderPass(): string {
    return this.configService.get<string>('SENDER_PASS') || '';
  }

  get recipientEmail(): string {
    return this.configService.get<string>('RECIPIENT_EMAIL') || '';
  }

  get agoraTokenTtlSeconds(): number {
    const raw = this.configService.get<number | string>(
      'AGORA_TOKEN_TTL_SECONDS',
    );
    const parsed = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(parsed) && (parsed as number) > 0
      ? (parsed as number)
      : 3600; // default 1 hour
  }

  // AWS Region (used for S3, MediaConvert, etc.)
  get awsRegion(): string {
    // Default to us-east-1 if not set; override via AWS_REGION or AWS_DEFAULT_REGION
    return (
      this.configService.get<string>('AWS_REGION') ||
      this.configService.get<string>('AWS_DEFAULT_REGION') ||
      'us-east-1'
    );
  }

  get awsAccessKey(): string {
    return (
      this.configService.get<string>('AWS_ACCESS_KEY_ID') ||
      this.configService.get<string>('AWS_ACCESS_KEY') ||
      ''
    );
  }

  get awsSecretKey(): string {
    return (
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
      this.configService.get<string>('AWS_SECRET_KEY') ||
      ''
    );
  }

  get awsSqsQueueUrl(): string {
    return this.configService.get<string>('AWS_SQS_VIDEO_QUEUE_URL') || '';
  }

  // Internal webhook secret for video processing completion
  get videoProcessingWebhookSecret(): string {
    return (
      this.configService.get<string>('VIDEO_PROCESSING_WEBHOOK_SECRET') || ''
    );
  }

  /** Netless App Identifier (used by frontend SDK) */
  get agoraWhiteboardAppId(): string {
    return this.configService.get<string>('AGORA_WHITEBOARD_APP_ID') || '';
  }

  /**
   * Netless SDK Token (used by backend for REST API calls).
   * Should be a "SDK Token" generated from Netless Console.
   */
  get agoraWhiteboardAppSecret(): string {
    return this.configService.get<string>('AGORA_WHITEBOARD_APP_SECRET') || '';
  }

  /**
   * Toggle to use Agora whiteboard instead of custom Socket.IO whiteboard.
   * "true" → use Agora; otherwise fallback to custom implementation.
   */
  get useAgoraWhiteboard(): boolean {
    const raw =
      this.configService.get<string>('USE_AGORA_WHITEBOARD') || 'false';
    return raw.toLowerCase() === 'true';
  }

  get agoraWhiteboardTokenTtlSeconds(): number {
    const raw = this.configService.get<number | string>(
      'AGORA_WHITEBOARD_TOKEN_TTL_SECONDS',
    );
    const parsed = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(parsed) && (parsed as number) > 0
      ? (parsed as number)
      : 3600; // default 1 hour
  }

  get agoraWhiteboardRegion(): string {
    return this.configService.get<string>('AGORA_WHITEBOARD_REGION') || 'cn-hz';
  }

  // Auth Rate Limiting
  get authRateLimitMax(): number {
    return this.configService.get<number>('AUTH_RATE_LIMIT_MAX') || 10;
  }

  get authRateLimitWindowSeconds(): number {
    return (
      this.configService.get<number>('AUTH_RATE_LIMIT_WINDOW_SECONDS') || 60
    );
  }

  get cloudfrontKeyPairId(): string {
    return this.configService.get<string>('CLOUDFRONT_KEY_PAIR_ID') || '';
  }

  get cloudfrontPrivateKeyBase64(): string {
    return (
      this.configService.get<string>('CLOUDFRONT_PRIVATE_KEY_BASE64') || ''
    );
  }

  get cloudfrontSignedUrlTtlSeconds(): number {
    return (
      this.configService.get<number>('CLOUDFRONT_SIGNED_URL_TTL_SECONDS') || 600
    );
  }

  get cloudfrontSignedUrlsEnabled(): boolean {
    return this.configService.get<boolean>('CLOUDFRONT_SIGNED_URLS_ENABLED') ?? false;
  }

  get cacheEnabled(): boolean {
    return this.configService.get<boolean>('CACHE_ENABLED') ?? false;
  }

  get cacheDefaultTtl(): number {
    return this.configService.get<number>('CACHE_DEFAULT_TTL_SECONDS') ?? 60;
  }

  get videoUploadsEnabled(): boolean {
    return this.configService.get<boolean>('VIDEO_UPLOADS_ENABLED') ?? false;
  }

  get videoProcessingQueueEnabled(): boolean {
    return this.configService.get<boolean>('VIDEO_PROCESSING_QUEUE_ENABLED') ?? false;
  }
}
