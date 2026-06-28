/**
 * TelegramModule — integrates Telegram bot and scheduled reminders.
 *
 * This module demonstrates how NestJS modules can IMPORT services
 * from other modules. SleepModule, DailyModule, and EnergyModule
 * all export their services, which makes them injectable here.
 *
 * The ScheduleModule enables cron-based job scheduling.
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { SleepModule } from '../sleep/sleep.module';
import { DailyModule } from '../daily/daily.module';
import { EnergyModule } from '../energy/energy.module';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramSchedulerService } from './telegram-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    SleepModule,
    DailyModule,
    EnergyModule,
  ],
  providers: [TelegramService, TelegramSchedulerService],
  controllers: [TelegramController],
})
export class TelegramModule {}
