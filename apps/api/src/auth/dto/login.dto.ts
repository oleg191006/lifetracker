/**
 * LoginDto — Data Transfer Object for the login request body.
 *
 * DTOs define the SHAPE of incoming data and use class-validator
 * decorators to enforce validation rules. If the incoming data
 * doesn't match, NestJS automatically returns a 400 Bad Request.
 *
 * This pattern separates "what the API accepts" from "what the DB stores".
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
