import { signCloudFrontUrl } from './cloudfront-signer';
import { AppConfigService } from '../app-config/app-config.service';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

jest.mock('@aws-sdk/cloudfront-signer', () => ({
  getSignedUrl: jest.fn().mockImplementation(({ url }) => `${url}?signed=true`),
}));

describe('signCloudFrontUrl', () => {
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      cloudfrontSignedUrlsEnabled: true,
      cloudfrontKeyPairId: 'test-id',
      cloudfrontPrivateKeyBase64: Buffer.from('test-key').toString('base64'),
      cloudfrontSignedUrlTtlSeconds: 600,
      isProduction: false,
    };
    jest.clearAllMocks();
  });

  it('signs URL when enabled and configured', () => {
    const url = 'https://cdn.com/asset.mp4';
    const result = signCloudFrontUrl(url, mockConfig as AppConfigService);
    expect(result).toBe(`${url}?signed=true`);
    expect(getSignedUrl).toHaveBeenCalled();
  });

  it('returns raw URL when disabled', () => {
    mockConfig.cloudfrontSignedUrlsEnabled = false;
    const url = 'https://cdn.com/asset.mp4';
    const result = signCloudFrontUrl(url, mockConfig as AppConfigService);
    expect(result).toBe(url);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('returns raw URL when config missing in non-prod', () => {
    mockConfig.cloudfrontKeyPairId = '';
    const url = 'https://cdn.com/asset.mp4';
    const result = signCloudFrontUrl(url, mockConfig as AppConfigService);
    expect(result).toBe(url);
  });

  it('throws 500 when config missing in production', () => {
    mockConfig.isProduction = true;
    mockConfig.cloudfrontKeyPairId = '';
    const url = 'https://cdn.com/asset.mp4';
    expect(() => signCloudFrontUrl(url, mockConfig as AppConfigService)).toThrow();
  });
});
