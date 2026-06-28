/**
 * CreateCourseDto — validates course creation data.
 */
import { IsString, IsInt, IsDateString, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  totalLessons: number;

  @IsDateString()
  deadline: string;
}
