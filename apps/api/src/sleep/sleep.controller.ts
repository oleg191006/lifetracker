/**
 * SleepController — REST API endpoints for sleep tracking.
 *
 * Routes:
 *   POST   /sleep          — create a sleep log entry
 *   GET    /sleep?from=&to= — list entries in a date range
 *   GET    /sleep/latest    — get the most recent entry
 *   GET    /sleep/stats     — get average duration and quality
 *
 * All routes are protected by JwtAuthGuard (applied globally).
 * The @GetUser() decorator extracts the authenticated user.
 */
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SleepService } from './sleep.service';
import { CreateSleepLogDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('sleep')
export class SleepController {
  constructor(private readonly sleepService: SleepService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateSleepLogDto) {
    return this.sleepService.create(user.id, dto);
  }

  /**
   * GET /sleep?from=2024-01-01&to=2024-01-31
   *
   * @Query() extracts URL query parameters.
   * If no range is given, defaults to the last 14 days.
   */
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

    return this.sleepService.findByDateRange(
      user.id,
      from || twoWeeksAgo,
      to || today,
    );
  }

  @Get('latest')
  findLatest(@GetUser() user: User) {
    return this.sleepService.findLatest(user.id);
  }

  /**
   * GET /sleep/stats?weeks=2
   * Returns aggregated averages over the specified number of weeks.
   */
  @Get('stats')
  getStats(@GetUser() user: User, @Query('weeks') weeks?: string) {
    return this.sleepService.getStats(user.id, weeks ? parseInt(weeks) : 2);
  }
}
