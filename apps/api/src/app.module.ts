/**
 * AppModule — the ROOT module of the NestJS application.
 *
 * This is where all feature modules are imported and assembled.
 * Think of it as the "table of contents" for the entire backend.
 *
 * The APP_GUARD provider applies JwtAuthGuard globally, meaning
 * every route is protected by default. Only routes decorated with
 * @Public() bypass authentication.
 */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SleepModule } from './sleep/sleep.module';
import { DailyModule } from './daily/daily.module';
import { EnergyModule } from './energy/energy.module';
import { CoursesModule } from './courses/courses.module';
import { LearningModule } from './learning/learning.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    SleepModule,
    DailyModule,
    EnergyModule,
    CoursesModule,
    LearningModule,
    AnalyticsModule,
    TelegramModule,
  ],
  providers: [
    // Apply JwtAuthGuard to ALL routes globally.
    // This means you don't need to add @UseGuards(JwtAuthGuard) to
    // every controller — it's the default behavior.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
