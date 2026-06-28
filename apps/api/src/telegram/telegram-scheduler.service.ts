/**
 * TelegramSchedulerService — sends daily reminders via Telegram.
 *
 * Uses @nestjs/schedule with @Cron decorators to run tasks
 * at specific times. The schedule module uses node-cron under the hood.
 *
 * Cron expression format: second minute hour dayOfMonth month dayOfWeek
 *
 * Reminders:
 * - 09:00 — Log your sleep
 * - 13:30 — Midday energy check
 * - 18:00 — Evening energy check
 * - 22:00 — Log your day
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TelegramSchedulerService {
  private readonly logger = new Logger(TelegramSchedulerService.name);

  /**
   * Send a message to the admin's Telegram chat.
   * Reuses the same Bot API approach as the controller.
   */
  private async sendReminder(text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return; // Skip if Telegram is not configured
    }

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      this.logger.log(`Reminder sent: ${text}`);
    } catch (error) {
      this.logger.error('Failed to send reminder', error);
    }
  }

  /** 09:00 — Morning sleep logging reminder */
  @Cron('0 0 9 * * *')
  async morningReminder() {
    await this.sendReminder(
      'Good morning! Log your sleep with /sleep BED WAKE QUALITY',
    );
  }

  /** 13:30 — Midday energy check */
  @Cron('0 30 13 * * *')
  async middayEnergyCheck() {
    await this.sendReminder(
      'Midday energy check! Use /energy LEVEL (1-10)',
    );
  }

  /** 18:00 — Evening energy check */
  @Cron('0 0 18 * * *')
  async eveningEnergyCheck() {
    await this.sendReminder(
      'Evening energy check! Use /energy LEVEL (1-10)',
    );
  }

  /** 22:00 — End-of-day logging reminder */
  @Cron('0 0 22 * * *')
  async eveningReminder() {
    await this.sendReminder(
      'Time to log your day! Use /score PLAN_PCT FOCUS ENERGY',
    );
  }
}
