/**
 * TelegramController — receives webhook callbacks from Telegram.
 *
 * When a user sends a message to our bot, Telegram forwards it
 * to this webhook URL. We process it and send a reply.
 *
 * The webhook endpoint is PUBLIC (no JWT) because Telegram
 * servers need to reach it. We validate the chat ID instead.
 */
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { TelegramService } from './telegram.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * POST /telegram/webhook
   *
   * Telegram sends updates to this endpoint.
   * We verify the chat ID matches the configured admin chat,
   * then process the command and reply.
   */
  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any): Promise<void> {
    const message = body?.message;
    if (!message?.text) return;

    const chatId = message.chat?.id?.toString();
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;

    // Only process messages from the configured chat
    if (allowedChatId && chatId !== allowedChatId) {
      this.logger.warn(`Unauthorized chat ID: ${chatId}`);
      return;
    }

    // Find the admin user (single-user app)
    const adminEmail = process.env.ADMIN_EMAIL;
    const user = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (!user) {
      this.logger.error('Admin user not found');
      return;
    }

    const reply = await this.telegramService.handleMessage(user.id, message.text);

    // Send the reply back to Telegram
    await this.sendMessage(chatId, reply);
  }

  /**
   * Send a message to a Telegram chat using the Bot API.
   * We use raw fetch instead of a library for simplicity.
   */
  private async sendMessage(chatId: string, text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
    }
  }
}
