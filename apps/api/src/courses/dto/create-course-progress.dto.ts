/**
 * CreateCourseProgressDto — validates study session data.
 */
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCourseProgressDto {
  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  lessonsFrom: number;

  @IsInt()
  @Min(1)
  lessonsTo: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
