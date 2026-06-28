/**
 * SleepModule — encapsulates all sleep tracking functionality.
 *
 * Exports SleepService so other modules (like TelegramModule)
 * can inject and use it without duplicating logic.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepLog } from './sleep-log.entity';
import { SleepService } from './sleep.service';
import { SleepController } from './sleep.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SleepLog])],
  providers: [SleepService],
  controllers: [SleepController],
  exports: [SleepService],
})
export class SleepModule {}
