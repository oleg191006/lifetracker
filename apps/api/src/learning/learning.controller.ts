/**
 * LearningController — REST API for learning logs.
 *
 * Routes:
 *   POST   /learning                         — create entry
 *   GET    /learning?course_id=&from=&to=    — list entries
 */
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateLearningLogDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateLearningLogDto) {
    return this.learningService.create(user.id, dto);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('course_id') courseId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.learningService.findAll(user.id, courseId, from, to);
  }
}
