/**
 * AuthController — handles HTTP requests for authentication.
 *
 * NestJS Controllers are responsible for:
 * 1. Defining routes (HTTP method + path)
 * 2. Parsing request data (body, params, query)
 * 3. Calling the appropriate service method
 * 4. Returning the response
 *
 * The actual business logic lives in AuthService — controllers should
 * be thin and only handle HTTP concerns.
 */
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   *
   * @Public() — this route is accessible without authentication
   * (otherwise you'd need to be logged in to log in, which is circular!)
   *
   * @HttpCode(200) — POST routes return 201 by default in NestJS,
   * but login is not "creating a resource", so 200 is more appropriate.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me
   *
   * Returns the currently authenticated user's profile.
   * The frontend calls this endpoint after page refresh to verify
   * that the stored JWT token is still valid and to load user data.
   *
   * Since JwtAuthGuard is applied globally, this route is automatically
   * protected — only requests with a valid JWT can reach it.
   * The @GetUser() decorator extracts the user object that Passport
   * attached to the request during JWT validation.
   */
  @Get('me')
  getProfile(@GetUser() user: User) {
    return user;
  }
}
