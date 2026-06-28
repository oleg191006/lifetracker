/**
 * @GetUser() — custom parameter decorator that extracts the authenticated
 * user from the request object.
 *
 * Instead of writing `@Request() req` and then `req.user` in every controller,
 * this decorator lets you write `@GetUser() user: User` — cleaner and more explicit.
 *
 * Usage in a controller:
 *   @Get('profile')
 *   getProfile(@GetUser() user: User) {
 *     return user;
 *   }
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user.entity';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    // Switch to HTTP context and extract the request object
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
