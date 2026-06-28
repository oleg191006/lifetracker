/**
 * CreateDailyLogDto — validates daily productivity log data.
 *
 * The daily log captures three metrics:
 * - plan_pct: what % of planned tasks were completed (0-100)
 * - focus: subjective focus level (1=low, 2=medium, 3=high)
 * - energy: end-of-day energy (1=drained, 2=still going)
 *
 * These produce a composite score: (plan_pct/100)*5 + focus + energy
 * Max score = 5 + 3 + 2 = 10
 */
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateDailyLogDto {
  @IsDateString()
  date: string;

  /** Percentage of planned tasks completed (0-100) */
  @IsInt()
  @Min(0)
  @Max(100)
  planPct: number;

  /** Focus level: 1 = low, 2 = medium, 3 = high */
  @IsInt()
  @Min(1)
  @Max(3)
  focus: number;

  /** End-of-day energy: 1 = drained, 2 = still going */
  @IsInt()
  @Min(1)
  @Max(2)
  energy: number;

  @IsOptional()
  @IsString()
  note?: string;
}
