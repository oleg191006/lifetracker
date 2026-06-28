/**
 * CreateLearningLogDto — validates learning log data.
 *
 * Follows the Feynman technique:
 * - insight: what did you learn? (required — forces active recall)
 * - confusion: what's still unclear? (optional — targets future study)
 */
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLearningLogDto {
  @IsUUID()
  courseId: string;

  /** Key insight — what you learned, in your own words */
  @IsString()
  @MinLength(10, { message: 'Please describe what you learned in at least 10 characters' })
  insight: string;

  /** What's still confusing or unclear */
  @IsOptional()
  @IsString()
  confusion?: string;

  /** Duration of the study session in minutes */
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number;
}
