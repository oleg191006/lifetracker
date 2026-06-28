/**
 * DailyController — REST API endpoints for daily productivity logs.
 *
 * Routes:
 *   POST   /daily            — create/update daily log (upsert)
 *   GET    /daily?from=&to=  — list entries in a date range
 *   GET    /daily/today      — get today's entry
 *   GET    /daily/stats      — get averages and weekday/weekend breakdown
 */
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { DailyService } from './daily.service';
import { CreateDailyLogDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('daily')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Post()
  upsert(@GetUser() user: User, @Body() dto: CreateDailyLogDto) {
    return this.dailyService.upsert(user.id, dto);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return this.dailyService.findByDateRange(
      user.id,
      from || twoWeeksAgo,
      to || today,
    );
  }

  @Get('today')
  findToday(@GetUser() user: User) {
    return this.dailyService.findToday(user.id);
  }

  @Get('stats')
  getStats(@GetUser() user: User, @Query('weeks') weeks?: string) {
    return this.dailyService.getStats(user.id, weeks ? parseInt(weeks) : 2);
  }
}
