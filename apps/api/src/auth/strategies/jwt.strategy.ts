/**
 * JwtStrategy — tells Passport HOW to validate JWT tokens.
 *
 * When a request arrives with an Authorization header like:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * Passport extracts the token, verifies its signature using JWT_SECRET,
 * then calls our `validate()` method with the decoded payload.
 *
 * The object returned by `validate()` is attached to `request.user`,
 * making it available in every controller via `@Request() req`.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

// The shape of data we encode inside the JWT token
interface JwtPayload {
  sub: string;   // "subject" — the user's UUID
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      // Extract the JWT from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Don't accept expired tokens
      ignoreExpiration: false,
      // The secret key used to verify the token's signature
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  /**
   * Called after the token is verified. We look up the user in the database
   * to make sure they still exist (they might have been deleted after the
   * token was issued).
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // This object becomes `req.user` in controllers
    return user;
  }
}
