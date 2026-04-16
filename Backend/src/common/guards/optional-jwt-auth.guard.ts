import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that is tolerant of missing or invalid tokens.
 *
 * - Valid token present  → attaches `req.user` and continues (same as JwtAuthGuard)
 * - No token / invalid   → sets `req.user = undefined` and continues (does NOT throw)
 *
 * Use this on endpoints where authentication is optional, e.g., public preview playback.
 * The route handler is responsible for checking whether `req.user` is populated.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Never throw on auth failure – just return null so req.user stays undefined.
  handleRequest(_err: any, user: any): any {
    return user || null;
  }

  // Override canActivate so that even if Passport throws internally we continue.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Swallow the error – unauthenticated callers are allowed through.
    }
    return true;
  }
}
