/**
 * DailyModule — encapsulates daily productivity tracking.
 * Exports DailyService for use by TelegramModule and AnalyticsModule.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyLog } from './daily-log.entity';
import { DailyService } from './daily.service';
import { DailyController } from './daily.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyLog])],
  providers: [DailyService],
  controllers: [DailyController],
  exports: [DailyService],
})
export class DailyModule {}
