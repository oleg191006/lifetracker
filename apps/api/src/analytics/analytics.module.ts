/**
 * AnalyticsModule — aggregated analytics across all tracking modules.
 *
 * Imports entities from OTHER modules because it needs to query
 * multiple tables. This is a read-only analytical module —
 * it never writes data, only aggregates what other modules created.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepLog } from '../sleep/sleep-log.entity';
import { DailyLog } from '../daily/daily-log.entity';
import { EnergyCheck } from '../energy/energy-check.entity';
import { CourseProgress } from '../courses/course-progress.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SleepLog, DailyLog, EnergyCheck, CourseProgress]),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
