/**
 * TelegramService — handles incoming Telegram bot messages.
 *
 * This service acts as a BRIDGE between Telegram's messaging interface
 * and the existing services (SleepService, DailyService, EnergyService).
 *
 * It reuses the SAME service methods that the REST API uses,
 * ensuring consistent behavior regardless of whether data comes
 * from the web app or Telegram.
 *
 * Commands:
 *   /sleep 00:30 07:40 4        — log sleep (bedTime wakeTime quality)
 *   /energy 8                   — log energy level
 *   /score 90 3 2               — log daily score (planPct focus energy)
 *   /today                      — get today's summary
 *   /week                       — get this week's averages
 */
import { Injectable, Logger } from '@nestjs/common';
import { SleepService } from '../sleep/sleep.service';
import { DailyService } from '../daily/daily.service';
import { EnergyService } from '../energy/energy.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly sleepService: SleepService,
    private readonly dailyService: DailyService,
    private readonly energyService: EnergyService,
  ) {}

  /**
   * Process an incoming message and route it to the correct handler.
   * Returns a text response to send back to the user.
   */
  async handleMessage(userId: string, text: string): Promise<string> {
    const trimmed = text.trim();
    const [command, ...args] = trimmed.split(/\s+/);

    try {
      switch (command.toLowerCase()) {
        case '/sleep':
          return this.handleSleep(userId, args);
        case '/energy':
          return this.handleEnergy(userId, args);
        case '/score':
          return this.handleScore(userId, args);
        case '/today':
          return this.handleToday(userId);
        case '/week':
          return this.handleWeek(userId);
        case '/start':
        case '/help':
          return this.getHelpText();
        default:
          return this.getHelpText();
      }
    } catch (error) {
      this.logger.error(`Error handling command: ${text}`, error);
      return `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`;
    }
  }

  /**
   * /sleep 00:30 07:40 4
   * Parses bed time, wake time, and quality from the message.
   */
  private async handleSleep(userId: string, args: string[]): Promise<string> {
    if (args.length < 3) {
      return 'Usage: /sleep BED_TIME WAKE_TIME QUALITY\nExample: /sleep 00:30 07:40 4';
    }

    const [bedTimeStr, wakeTimeStr, qualityStr] = args;
    const quality = parseInt(qualityStr);

    if (isNaN(quality) || quality < 1 || quality > 5) {
      return 'Quality must be between 1 and 5';
    }

    const today = new Date().toISOString().split('T')[0];

    // Build timestamps from time strings
    const bedTime = new Date(`${today}T${bedTimeStr}:00`);
    const wakeTime = new Date(`${today}T${wakeTimeStr}:00`);

    // Handle overnight sleep (e.g. bed at 23:30, wake at 07:00)
    if (wakeTime <= bedTime) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }

    const entry = await this.sleepService.create(userId, {
      date: today,
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      quality,
    });

    const hours = Math.floor(entry.durationMin / 60);
    const mins = entry.durationMin % 60;

    return `Sleep logged! Duration: ${hours}h ${mins}m, Quality: ${quality}/5`;
  }

  /**
   * /energy 8
   * Quick energy check-in with just a level number.
   */
  private async handleEnergy(userId: string, args: string[]): Promise<string> {
    if (args.length < 1) {
      return 'Usage: /energy LEVEL\nExample: /energy 8';
    }

    const level = parseInt(args[0]);
    if (isNaN(level) || level < 1 || level > 10) {
      return 'Energy level must be between 1 and 10';
    }

    await this.energyService.create(userId, { level });

    const labels = ['', 'Exhausted', 'Very low', 'Low', 'Below avg',
      'Average', 'Above avg', 'Good', 'High', 'Very high', 'Peak'];

    return `Energy logged: ${level}/10 (${labels[level]})`;
  }

  /**
   * /score 90 3 2
   * Log daily productivity: planPct, focus, energy.
   */
  private async handleScore(userId: string, args: string[]): Promise<string> {
    if (args.length < 3) {
      return 'Usage: /score PLAN_PCT FOCUS ENERGY\nExample: /score 90 3 2';
    }

    const planPct = parseInt(args[0]);
    const focus = parseInt(args[1]);
    const energy = parseInt(args[2]);

    if (isNaN(planPct) || planPct < 0 || planPct > 100) {
      return 'Plan percentage must be between 0 and 100';
    }
    if (isNaN(focus) || focus < 1 || focus > 3) {
      return 'Focus must be between 1 and 3';
    }
    if (isNaN(energy) || energy < 1 || energy > 2) {
      return 'Energy must be 1 or 2';
    }

    const today = new Date().toISOString().split('T')[0];
    const entry = await this.dailyService.upsert(userId, {
      date: today,
      planPct,
      focus,
      energy,
    });

    return `Day scored: ${entry.score}/10\nPlan: ${planPct}% | Focus: ${focus}/3 | Energy: ${energy}/2`;
  }

  /**
   * /today — returns a summary of today's logged data.
   */
  private async handleToday(userId: string): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const lines: string[] = ['Today\'s Summary:'];

    const daily = await this.dailyService.findToday(userId);
    if (daily) {
      lines.push(`Score: ${daily.score}/10 (Plan: ${daily.planPct}%)`);
    } else {
      lines.push('Score: not logged yet');
    }

    const sleep = await this.sleepService.findLatest(userId);
    if (sleep && sleep.date === today) {
      const h = Math.floor(sleep.durationMin / 60);
      const m = sleep.durationMin % 60;
      lines.push(`Sleep: ${h}h ${m}m (Quality: ${sleep.quality}/5)`);
    } else {
      lines.push('Sleep: not logged yet');
    }

    const energy = await this.energyService.findLatest(userId);
    if (energy) {
      lines.push(`Energy: ${energy.level}/10`);
    }

    return lines.join('\n');
  }

  /**
   * /week — returns average stats for the current week.
   */
  private async handleWeek(userId: string): Promise<string> {
    const dailyStats = await this.dailyService.getStats(userId, 1);
    const sleepStats = await this.sleepService.getStats(userId, 1);

    const lines = [
      'This Week\'s Averages:',
      `Score: ${dailyStats.avgScore}/10`,
      `Plan completion: ${dailyStats.avgPlanPct}%`,
      `Sleep: ${Math.round(sleepStats.avgDuration / 60)}h ${sleepStats.avgDuration % 60}m`,
      `Sleep quality: ${sleepStats.avgQuality}/5`,
      `Days logged: ${dailyStats.totalEntries}`,
    ];

    return lines.join('\n');
  }

  private getHelpText(): string {
    return [
      'Life Tracker Bot Commands:',
      '',
      '/sleep 00:30 07:40 4 — Log sleep',
      '/energy 8 — Log energy (1-10)',
      '/score 90 3 2 — Log daily (plan% focus energy)',
      '/today — Today\'s summary',
      '/week — This week\'s averages',
    ].join('\n');
  }
}
