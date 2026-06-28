/**
 * JwtAuthGuard — protects routes by requiring a valid JWT token.
 *
 * NestJS Guards run BEFORE the route handler. If the guard returns false
 * or throws an exception, the request is denied.
 *
 * By extending AuthGuard('jwt'), we delegate the actual token validation
 * to Passport's JWT strategy (jwt.strategy.ts).
 *
 * This guard is applied GLOBALLY in AppModule, meaning ALL routes are
 * protected by default. Routes that should be public (like /auth/login)
 * use the @Public() decorator to bypass the guard.
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Before activating the JWT check, see if the route is marked as @Public().
   * If so, skip authentication entirely.
   */
  canActivate(context: ExecutionContext) {
    // Reflector reads metadata set by decorators
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check the method first
      context.getClass(),   // Then check the class
    ]);

    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    // Proceed with standard JWT validation
    return super.canActivate(context);
  }
}
