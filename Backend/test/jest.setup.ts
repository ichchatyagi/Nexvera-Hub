/**
 * Global Jest setup for Nexvera Backend tests.
 * This script suppresses noisy logs (console.log, warn, error) during tests
 * to keep CI output clean, unless TEST_LOGS=1 is set.
 */

if (process.env.TEST_LOGS !== '1') {
  // Silence typical console outputs
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});

  // Silence NestJS Framework logs
  try {
    const { Logger } = require('@nestjs/common');
    // Silence static Logger
    Logger.overrideLogger(false);
    
    // Patch instance methods too (catches persistent instances)
    Logger.prototype.log = () => {};
    Logger.prototype.error = () => {};
    Logger.prototype.warn = () => {};
    Logger.prototype.debug = () => {};
    Logger.prototype.verbose = () => {};
  } catch (e) {
    // Ignore if nestjs/common is not available
  }

  // Suppress only the noisy Node warning for localstorage
  const originalEmitWarning = process.emitWarning;
  (process as any).emitWarning = (warning: any, ...args: any[]) => {
    const msg = typeof warning === 'string' ? warning : (warning?.message ?? '');
    if (msg.includes('--localstorage-file')) {
      return;
    }
    return (originalEmitWarning as any).apply(process, [warning, ...args]);
  };
}
