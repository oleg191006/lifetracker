/**
 * DailyService — business logic for daily productivity tracking.
 *
 * Key feature: UPSERT behavior on create.
 * Since there's only one daily log per date (unique constraint),
 * if the user submits for a date that already has an entry,
 * we UPDATE the existing entry rather than creating a duplicate.
 * This makes the UI simpler — no need for separate edit/create flows.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyLog } from './daily-log.entity';
import { CreateDailyLogDto } from './dto';

@Injectable()
export class DailyService {
  private readonly logger = new Logger(DailyService.name);

  constructor(
    @InjectRepository(DailyLog)
    private readonly dailyRepository: Repository<DailyLog>,
  ) {}

  /**
   * Create or update a daily log (upsert by date).
   *
   * First checks if an entry exists for this date.
   * If yes → updates it. If no → creates a new one.
   * The entity's @BeforeInsert/@BeforeUpdate hook calculates the score.
   */
  async upsert(userId: string, dto: CreateDailyLogDto): Promise<DailyLog> {
    let entry = await this.dailyRepository.findOne({
      where: { userId, date: dto.date },
    });

    if (entry) {
      // Update existing entry
      entry.planPct = dto.planPct;
      entry.focus = dto.focus;
      entry.energy = dto.energy;
      entry.note = dto.note || null;
    } else {
      // Create new entry
      entry = this.dailyRepository.create({
        userId,
        date: dto.date,
        planPct: dto.planPct,
        focus: dto.focus,
        energy: dto.energy,
        note: dto.note || null,
      });
    }

    const saved = await this.dailyRepository.save(entry);
    this.logger.log(`Daily log upserted for ${dto.date}: score=${saved.score}`);
    return saved;
  }

  /**
   * Retrieve daily logs within a date range.
   */
  async findByDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<DailyLog[]> {
    return this.dailyRepository.find({
      where: {
        userId,
        date: Between(from, to),
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * Get today's daily log (if it exists).
   */
  async findToday(userId: string): Promise<DailyLog | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyRepository.findOne({
      where: { userId, date: today },
    });
  }

  /**
   * Calculate daily statistics over a number of weeks.
   *
   * Includes weekday vs weekend comparison to reveal patterns like
   * "I'm more productive on weekdays" or "weekends are for recovery."
   *
   * PostgreSQL's EXTRACT(DOW FROM date) returns 0=Sunday, 6=Saturday.
   * Weekday = DOW between 1 and 5, Weekend = DOW in (0, 6).
   */
  async getStats(
    userId: string,
    weeks: number = 2,
  ): Promise<{
    avgScore: number;
    avgPlanPct: number;
    weekdayAvg: number;
    weekendAvg: number;
    totalEntries: number;
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - weeks * 7);
    const from = fromDate.toISOString().split('T')[0];

    // Overall averages
    const overall = await this.dailyRepository
      .createQueryBuilder('d')
      .select('ROUND(AVG(d.score)::numeric, 2)', 'avgScore')
      .addSelect('ROUND(AVG(d.plan_pct)::numeric, 1)', 'avgPlanPct')
      .addSelect('COUNT(*)::int', 'totalEntries')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .getRawOne();

    // Weekday average (Mon-Fri)
    const weekday = await this.dailyRepository
      .createQueryBuilder('d')
      .select('ROUND(AVG(d.score)::numeric, 2)', 'avg')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .andWhere('EXTRACT(DOW FROM d.date::date) BETWEEN 1 AND 5')
      .getRawOne();

    // Weekend average (Sat-Sun)
    const weekend = await this.dailyRepository
      .createQueryBuilder('d')
      .select('ROUND(AVG(d.score)::numeric, 2)', 'avg')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .andWhere('EXTRACT(DOW FROM d.date::date) IN (0, 6)')
      .getRawOne();

    return {
      avgScore: parseFloat(overall.avgScore) || 0,
      avgPlanPct: parseFloat(overall.avgPlanPct) || 0,
      weekdayAvg: parseFloat(weekday.avg) || 0,
      weekendAvg: parseFloat(weekend.avg) || 0,
      totalEntries: parseInt(overall.totalEntries) || 0,
    };
  }
}
