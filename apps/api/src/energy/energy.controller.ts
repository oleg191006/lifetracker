/**
 * EnergyController — REST API endpoints for energy tracking.
 *
 * Routes:
 *   POST   /energy         — log an energy check-in
 *   GET    /energy?date=   — list checks for a date
 *   GET    /energy/latest  — get most recent check
 *   GET    /energy/peak    — get peak energy hours
 */
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EnergyService } from './energy.service';
import { CreateEnergyCheckDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('energy')
export class EnergyController {
  constructor(private readonly energyService: EnergyService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateEnergyCheckDto) {
    return this.energyService.create(user.id, dto);
  }

  @Get()
  findByDate(@GetUser() user: User, @Query('date') date?: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.energyService.findByDate(user.id, date || today);
  }

  @Get('latest')
  findLatest(@GetUser() user: User) {
    return this.energyService.findLatest(user.id);
  }

  @Get('peak')
  findPeakHours(@GetUser() user: User, @Query('days') days?: string) {
    return this.energyService.findPeakHours(user.id, days ? parseInt(days) : 14);
  }
}
