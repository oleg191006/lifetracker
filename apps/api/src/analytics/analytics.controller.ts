/**
 * AnalyticsController — endpoints for aggregated analytics.
 *
 * Routes:
 *   GET /analytics/weekly?weeks=4    — weekly summaries
 *   GET /analytics/patterns          — behavioral patterns
 */
import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  getWeeklySummaries(
    @GetUser() user: User,
    @Query('weeks') weeks?: string,
  ) {
    return this.analyticsService.getWeeklySummaries(
      user.id,
      weeks ? parseInt(weeks) : 4,
    );
  }

  @Get('patterns')
  getPatterns(@GetUser() user: User) {
    return this.analyticsService.getPatterns(user.id);
  }
}
