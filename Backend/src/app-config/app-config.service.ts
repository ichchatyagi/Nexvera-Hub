import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get environment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
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
}
