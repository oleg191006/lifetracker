/**
 * AuthService — handles user authentication logic.
 *
 * Key responsibilities:
 * 1. Validate credentials (email + password) during login
 * 2. Issue JWT tokens upon successful login
 * 3. Seed the admin user on application startup
 *
 * The service uses bcryptjs for password hashing. bcrypt is a one-way
 * hash function — you can hash a password and later verify a password
 * against the hash, but you cannot reverse the hash back to the password.
 */
import {
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  // NestJS built-in logger — better than console.log because it includes
  // timestamps, context labels, and respects log level configuration.
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * OnModuleInit lifecycle hook — runs once when the module is initialized.
   * We use it to seed the admin user if they don't exist yet.
   */
  async onModuleInit() {
    await this.seedAdminUser();
  }

  /**
   * Validates the user's credentials and returns a JWT token.
   *
   * Steps:
   * 1. Find the user by email (with password included)
   * 2. Compare the provided password with the stored hash
   * 3. If valid, generate and return a JWT token
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = dto;

    // We need to explicitly select the password field because
    // user.entity.ts has `select: false` on the password column.
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // bcrypt.compare() hashes the input password with the same salt
    // and compares the result to the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create the JWT payload — this data is encoded (not encrypted!)
    // inside the token. Anyone can decode it, but only the server
    // can verify the signature.
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * Seeds the admin user from environment variables.
   * Only creates the user if they don't already exist.
   */
  private async seedAdminUser(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping user seed',
      );
      return;
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.log(`Admin user already exists: ${email}`);
      return;
    }

    // Hash the password with a salt round of 10
    // Higher salt rounds = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    this.logger.log(`Admin user created: ${email}`);
  }
}
