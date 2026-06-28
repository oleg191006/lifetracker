/**
 * CreateSleepLogDto — validates incoming sleep log data.
 *
 * class-validator decorators enforce rules at the HTTP layer,
 * BEFORE the data reaches the service. This is the first line
 * of defense against invalid data.
 *
 * class-transformer's @Transform decorator can convert incoming
 * strings to the correct types (e.g., date strings → Date objects).
 */
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateSleepLogDto {
  /** The date this sleep entry belongs to (ISO format: "2024-01-15") */
  @IsDateString()
  date: string;

  /** When the user went to bed (ISO timestamp: "2024-01-15T00:30:00") */
  @IsDateString()
  bedTime: string;

  /** When the user woke up (ISO timestamp: "2024-01-15T07:40:00") */
  @IsDateString()
  wakeTime: string;

  /** Subjective quality rating: 1 (terrible) to 5 (excellent) */
  @IsInt()
  @Min(1)
  @Max(5)
  quality: number;

  /** Optional note about the sleep */
  @IsOptional()
  @IsString()
  note?: string;
}
