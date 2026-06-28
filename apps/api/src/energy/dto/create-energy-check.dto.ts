/**
 * CreateEnergyCheckDto — validates energy check-in data.
 *
 * Energy checks are quick — just a level (1-10) and optional note.
 * The timestamp is auto-generated server-side, so the user
 * only needs to submit two fields.
 */
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateEnergyCheckDto {
  /** Energy level from 1 (exhausted) to 10 (peak energy) */
  @IsInt()
  @Min(1)
  @Max(10)
  level: number;

  @IsOptional()
  @IsString()
  note?: string;
}
