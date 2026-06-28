/**
 * SleepService — business logic for sleep tracking.
 *
 * Services are the heart of a NestJS application. They contain
 * the actual business logic, independent of HTTP concerns.
 *
 * This service is SHARED — both the REST controller and the
 * Telegram bot module (Phase 4) will call these same methods.
 * This prevents duplicating logic across different interfaces.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SleepLog } from './sleep-log.entity';
import { CreateSleepLogDto } from './dto';

@Injectable()
export class SleepService {
  private readonly logger = new Logger(SleepService.name);

  constructor(
    @InjectRepository(SleepLog)
    private readonly sleepRepository: Repository<SleepLog>,
  ) {}

  /**
   * Create a new sleep log entry.
   *
   * The entity's @BeforeInsert hook automatically calculates
   * duration_min from bedTime and wakeTime.
   */
  async create(userId: string, dto: CreateSleepLogDto): Promise<SleepLog> {
    const entry = this.sleepRepository.create({
      userId,
      date: dto.date,
      bedTime: new Date(dto.bedTime),
      wakeTime: new Date(dto.wakeTime),
      quality: dto.quality,
      note: dto.note || null,
    });

    const saved = await this.sleepRepository.save(entry);
    this.logger.log(`Sleep log created for ${dto.date}: ${saved.durationMin}min`);
    return saved;
  }

  /**
   * Retrieve sleep logs within a date range.
   *
   * TypeORM's `Between` operator generates:
   *   WHERE date >= :from AND date <= :to
   *
   * Results are ordered newest-first for display purposes.
   */
  async findByDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<SleepLog[]> {
    return this.sleepRepository.find({
      where: {
        userId,
        date: Between(from, to),
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * Get the most recent sleep log (last night's sleep).
   * Used by the dashboard to show "Last Night Sleep" card.
   */
  async findLatest(userId: string): Promise<SleepLog | null> {
    return this.sleepRepository.findOne({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  /**
   * Calculate sleep statistics over a number of weeks.
   *
   * Uses raw SQL aggregation via QueryBuilder for efficiency —
   * we let the database calculate averages rather than loading
   * all records into memory.
   *
   * ROUND(..., 1) keeps one decimal place for readability.
   */
  async getStats(
    userId: string,
    weeks: number = 2,
  ): Promise<{ avgDuration: number; avgQuality: number; totalEntries: number }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - weeks * 7);

    const result = await this.sleepRepository
      .createQueryBuilder('sleep')
      .select('ROUND(AVG(sleep.duration_min)::numeric, 1)', 'avgDuration')
      .addSelect('ROUND(AVG(sleep.quality)::numeric, 1)', 'avgQuality')
      .addSelect('COUNT(*)::int', 'totalEntries')
      .where('sleep.user_id = :userId', { userId })
      .andWhere('sleep.date >= :from', { from: fromDate.toISOString().split('T')[0] })
      .getRawOne();

    return {
      avgDuration: parseFloat(result.avgDuration) || 0,
      avgQuality: parseFloat(result.avgQuality) || 0,
      totalEntries: parseInt(result.totalEntries) || 0,
    };
  }
}
