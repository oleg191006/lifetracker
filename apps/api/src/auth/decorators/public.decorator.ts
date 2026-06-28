/**
 * @Public() decorator — marks a route as publicly accessible.
 *
 * When JwtAuthGuard is applied globally, EVERY route requires authentication
 * by default. Use @Public() on routes that should be accessible without
 * a JWT token (e.g., the login endpoint).
 *
 * How it works:
 * 1. SetMetadata() attaches a key-value pair to the route's metadata
 * 2. JwtAuthGuard reads this metadata via Reflector
 * 3. If IS_PUBLIC_KEY is true, the guard skips JWT validation
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
