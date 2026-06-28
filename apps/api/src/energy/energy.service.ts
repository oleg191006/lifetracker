/**
 * EnergyService — business logic for energy level tracking.
 *
 * Energy checks are designed to be QUICK — the user can log their
 * current energy level in seconds. Over time, the data reveals
 * patterns like peak energy hours and energy dips.
 *
 * The peak-hour analysis groups check-ins by hour of day and
 * calculates the average energy level for each hour. This helps
 * the user schedule demanding tasks during their peak hours.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnergyCheck } from './energy-check.entity';
import { CreateEnergyCheckDto } from './dto';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);

  constructor(
    @InjectRepository(EnergyCheck)
    private readonly energyRepository: Repository<EnergyCheck>,
  ) {}

  /**
   * Create a new energy check-in.
   * The checked_at timestamp auto-defaults to NOW() in the entity.
   */
  async create(userId: string, dto: CreateEnergyCheckDto): Promise<EnergyCheck> {
    const entry = this.energyRepository.create({
      userId,
      level: dto.level,
      note: dto.note || null,
    });

    const saved = await this.energyRepository.save(entry);
    this.logger.log(`Energy check-in: level ${dto.level}`);
    return saved;
  }

  /**
   * Get all energy checks for a specific date.
   * Shows the user their energy pattern throughout the day.
   */
  async findByDate(userId: string, date: string): Promise<EnergyCheck[]> {
    return this.energyRepository
      .createQueryBuilder('e')
      .where('e.user_id = :userId', { userId })
      .andWhere('DATE(e.checked_at) = :date', { date })
      .orderBy('e.checked_at', 'ASC')
      .getMany();
  }

  /**
   * Get the latest energy check-in.
   * Used by the dashboard to display current energy level.
   */
  async findLatest(userId: string): Promise<EnergyCheck | null> {
    return this.energyRepository.findOne({
      where: { userId },
      order: { checkedAt: 'DESC' },
    });
  }

  /**
   * Find peak energy hours over the last N days.
   *
   * Groups all check-ins by hour (0-23) and calculates the average
   * energy level for each hour. Returns results sorted by average
   * level descending — the first result is the "peak hour."
   *
   * PostgreSQL's EXTRACT(HOUR FROM timestamp) gives us the hour (0-23).
   * We round the average to 1 decimal for readability.
   */
  async findPeakHours(
    userId: string,
    days: number = 14,
  ): Promise<Array<{ hour: number; avgLevel: number; count: number }>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const results = await this.energyRepository
      .createQueryBuilder('e')
      .select('EXTRACT(HOUR FROM e.checked_at)::int', 'hour')
      .addSelect('ROUND(AVG(e.level)::numeric, 1)', 'avgLevel')
      .addSelect('COUNT(*)::int', 'count')
      .where('e.user_id = :userId', { userId })
      .andWhere('e.checked_at >= :from', { from: fromDate.toISOString() })
      .groupBy('EXTRACT(HOUR FROM e.checked_at)')
      .orderBy('"avgLevel"', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      hour: parseInt(r.hour),
      avgLevel: parseFloat(r.avgLevel),
      count: parseInt(r.count),
    }));
  }
}
