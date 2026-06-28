/**
 * AnalyticsService — aggregates data across all tracking modules
 * to provide weekly summaries and pattern insights.
 *
 * Unlike other services that operate on a single entity,
 * this service queries MULTIPLE repositories to build a
 * holistic view of the user's productivity patterns.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SleepLog } from '../sleep/sleep-log.entity';
import { DailyLog } from '../daily/daily-log.entity';
import { EnergyCheck } from '../energy/energy-check.entity';
import { CourseProgress } from '../courses/course-progress.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SleepLog)
    private readonly sleepRepo: Repository<SleepLog>,
    @InjectRepository(DailyLog)
    private readonly dailyRepo: Repository<DailyLog>,
    @InjectRepository(EnergyCheck)
    private readonly energyRepo: Repository<EnergyCheck>,
    @InjectRepository(CourseProgress)
    private readonly progressRepo: Repository<CourseProgress>,
  ) {}

  /**
   * Get a weekly summary for a specific week number (0 = current, 1 = last week, etc.)
   * or retrieve summaries for the last N weeks.
   *
   * Each weekly summary contains:
   * - Average daily score
   * - Average sleep duration and quality
   * - Average energy level
   * - Total study hours
   * - Number of entries
   */
  async getWeeklySummaries(
    userId: string,
    weeks: number = 4,
  ): Promise<Array<{
    weekStart: string;
    weekEnd: string;
    avgScore: number;
    avgSleepDuration: number;
    avgSleepQuality: number;
    avgEnergyLevel: number;
    totalStudyMin: number;
    daysLogged: number;
  }>> {
    const summaries = [];

    for (let w = 0; w < weeks; w++) {
      const end = new Date();
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      const weekStart = start.toISOString().split('T')[0];
      const weekEnd = end.toISOString().split('T')[0];

      // Run all queries for this week in parallel
      const [dailyResult, sleepResult, energyResult, studyResult] =
        await Promise.all([
          // Daily score average
          this.dailyRepo
            .createQueryBuilder('d')
            .select('ROUND(AVG(d.score)::numeric, 2)', 'avgScore')
            .addSelect('COUNT(*)::int', 'count')
            .where('d.user_id = :userId', { userId })
            .andWhere('d.date BETWEEN :start AND :end', { start: weekStart, end: weekEnd })
            .getRawOne(),

          // Sleep averages
          this.sleepRepo
            .createQueryBuilder('s')
            .select('ROUND(AVG(s.duration_min)::numeric, 0)', 'avgDuration')
            .addSelect('ROUND(AVG(s.quality)::numeric, 1)', 'avgQuality')
            .where('s.user_id = :userId', { userId })
            .andWhere('s.date BETWEEN :start AND :end', { start: weekStart, end: weekEnd })
            .getRawOne(),

          // Energy average
          this.energyRepo
            .createQueryBuilder('e')
            .select('ROUND(AVG(e.level)::numeric, 1)', 'avgLevel')
            .where('e.user_id = :userId', { userId })
            .andWhere('DATE(e.checked_at) BETWEEN :start AND :end', { start: weekStart, end: weekEnd })
            .getRawOne(),

          // Total study minutes
          this.progressRepo
            .createQueryBuilder('p')
            .innerJoin('p.course', 'c')
            .select('COALESCE(SUM(p.duration_min), 0)::int', 'totalMin')
            .where('c.user_id = :userId', { userId })
            .andWhere('p.date BETWEEN :start AND :end', { start: weekStart, end: weekEnd })
            .getRawOne(),
        ]);

      summaries.push({
        weekStart,
        weekEnd,
        avgScore: parseFloat(dailyResult?.avgScore) || 0,
        avgSleepDuration: parseFloat(sleepResult?.avgDuration) || 0,
        avgSleepQuality: parseFloat(sleepResult?.avgQuality) || 0,
        avgEnergyLevel: parseFloat(energyResult?.avgLevel) || 0,
        totalStudyMin: parseInt(studyResult?.totalMin) || 0,
        daysLogged: parseInt(dailyResult?.count) || 0,
      });
    }

    return summaries;
  }

  /**
   * Detect patterns in user behavior:
   * - Weekday vs weekend score comparison
   * - Sleep-score correlation (do better sleep nights lead to better days?)
   * - Study hours per course (for stacked chart)
   */
  async getPatterns(
    userId: string,
  ): Promise<{
    weekdayAvgScore: number;
    weekendAvgScore: number;
    sleepScoreCorrelation: Array<{ sleepHours: number; score: number; date: string }>;
    studyByCourse: Array<{ courseName: string; totalMin: number }>;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const from = thirtyDaysAgo.toISOString().split('T')[0];

    // Weekday vs weekend score
    const weekdayResult = await this.dailyRepo
      .createQueryBuilder('d')
      .select('ROUND(AVG(d.score)::numeric, 2)', 'avg')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .andWhere('EXTRACT(DOW FROM d.date::date) BETWEEN 1 AND 5')
      .getRawOne();

    const weekendResult = await this.dailyRepo
      .createQueryBuilder('d')
      .select('ROUND(AVG(d.score)::numeric, 2)', 'avg')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .andWhere('EXTRACT(DOW FROM d.date::date) IN (0, 6)')
      .getRawOne();

    // Sleep vs score correlation data — join sleep and daily on same date
    const correlationData = await this.dailyRepo
      .createQueryBuilder('d')
      .innerJoin(SleepLog, 's', 's.user_id = d.user_id AND s.date = d.date')
      .select('d.date', 'date')
      .addSelect('ROUND(s.duration_min / 60.0, 1)', 'sleepHours')
      .addSelect('d.score', 'score')
      .where('d.user_id = :userId', { userId })
      .andWhere('d.date >= :from', { from })
      .orderBy('d.date', 'ASC')
      .getRawMany();

    // Study hours grouped by course
    const studyByCourse = await this.progressRepo
      .createQueryBuilder('p')
      .innerJoin('p.course', 'c')
      .select('c.name', 'courseName')
      .addSelect('COALESCE(SUM(p.duration_min), 0)::int', 'totalMin')
      .where('c.user_id = :userId', { userId })
      .andWhere('p.date >= :from', { from })
      .groupBy('c.name')
      .orderBy('"totalMin"', 'DESC')
      .getRawMany();

    return {
      weekdayAvgScore: parseFloat(weekdayResult?.avg) || 0,
      weekendAvgScore: parseFloat(weekendResult?.avg) || 0,
      sleepScoreCorrelation: correlationData.map((r) => ({
        sleepHours: parseFloat(r.sleepHours) || 0,
        score: parseFloat(r.score) || 0,
        date: r.date,
      })),
      studyByCourse: studyByCourse.map((r) => ({
        courseName: r.courseName,
        totalMin: parseInt(r.totalMin) || 0,
      })),
    };
  }
}
