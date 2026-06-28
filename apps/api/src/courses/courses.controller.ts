/**
 * CoursesController — full CRUD + progress tracking for courses.
 *
 * Routes:
 *   POST   /courses               — create a course
 *   GET    /courses               — list all courses
 *   GET    /courses/:id           — get a course by ID
 *   PATCH  /courses/:id           — update a course
 *   DELETE /courses/:id           — delete a course
 *   POST   /courses/:id/progress  — log a study session
 *   GET    /courses/:id/stats     — get course statistics
 *   GET    /courses/study-hours   — total study hours this week
 */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseProgressDto,
} from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.id, dto);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('active') active?: string,
  ) {
    return this.coursesService.findAll(user.id, active !== 'false');
  }

  /** This route must be defined BEFORE /:id to avoid path conflicts */
  @Get('study-hours')
  getStudyHours(@GetUser() user: User) {
    return this.coursesService.getWeeklyStudyHours(user.id);
  }

  @Get(':id')
  findOne(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.remove(user.id, id);
  }

  @Post(':id/progress')
  logProgress(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCourseProgressDto,
  ) {
    return this.coursesService.logProgress(user.id, id, dto);
  }

  @Get(':id/stats')
  getStats(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.getStats(user.id, id);
  }
}
