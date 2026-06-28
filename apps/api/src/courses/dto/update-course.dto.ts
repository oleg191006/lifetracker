/**
 * UpdateCourseDto — partial update for courses.
 *
 * PartialType creates a new class with all properties from
 * CreateCourseDto marked as optional. This means the client
 * can send only the fields they want to update.
 *
 * Note: We implement this manually since we're not using
 * @nestjs/mapped-types to keep dependencies minimal.
 */
import {
  IsString,
  IsInt,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalLessons?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
