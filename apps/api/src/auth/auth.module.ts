/**
 * AuthModule — bundles all authentication-related providers.
 *
 * NestJS Modules organize the application into cohesive blocks.
 * Each module declares:
 * - imports:     other modules this module depends on
 * - providers:   services, strategies, guards to be instantiated
 * - controllers: HTTP route handlers
 * - exports:     providers that should be available to other modules
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Register the User entity so we can inject its Repository
    TypeOrmModule.forFeature([User]),

    // PassportModule enables Passport.js integration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule.register() configures the JWT service.
    // We use `as const` on the expiresIn string so TypeScript recognizes
    // it as a valid StringValue type (e.g. '30d', '1h', '7d').
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  // Export these so other modules can use them
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
