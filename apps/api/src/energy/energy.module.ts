/**
 * EnergyModule — encapsulates energy tracking functionality.
 * Exports EnergyService for the Telegram bot and analytics modules.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnergyCheck } from './energy-check.entity';
import { EnergyService } from './energy.service';
import { EnergyController } from './energy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EnergyCheck])],
  providers: [EnergyService],
  controllers: [EnergyController],
  exports: [EnergyService],
})
export class EnergyModule {}
