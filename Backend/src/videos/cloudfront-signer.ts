import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { AppConfigService } from '../app-config/app-config.service';

const logger = new Logger('CloudFrontSigner');

/**
 * Signs a CloudFront URL using RSA key pairs.
 * If signing is disabled or not configured in non-production, returns the raw URL.
 * Throws InternalServerErrorException if misconfigured in production.
 */
export function signCloudFrontUrl(
  url: string | null | undefined,
  configService: AppConfigService,
): any {
  if (!url) return url;
  
  // If signing is explicitly disabled via config, return as is
  if (!configService.cloudfrontSignedUrlsEnabled) {
    return url;
  }

  const keyPairId = configService.cloudfrontKeyPairId;
  const privateKeyBase64 = configService.cloudfrontPrivateKeyBase64;

  // Validation
  if (!keyPairId || !privateKeyBase64) {
    if (configService.isProduction) {
      logger.error('CloudFront signing enabled in production but credentials missing');
      throw new InternalServerErrorException(
        'CloudFront signing configuration missing',
      );
    }
    // Non-prod fallback to raw URL if signing enabled but not configured
    return url;
  }

  try {
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
    
    // dateLessThan should be in the future (TTL from config)
    const dateLessThan = new Date(
      Date.now() + configService.cloudfrontSignedUrlTtlSeconds * 1000,
    ).toISOString();

    return getSignedUrl({
      url,
      keyPairId,
      privateKey,
      dateLessThan,
    });
  } catch (error) {
    logger.error(`Failed to sign CloudFront URL: ${error.message}`);
    
    if (configService.isProduction) {
      throw new InternalServerErrorException(
        'Media delivery authorization failure',
      );
    }
    
    // Non-prod fallback
    return url;
  }
}
