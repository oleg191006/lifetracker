/**
 * CoursesService — business logic for course management.
 *
 * Handles full CRUD for courses and logging study sessions.
 * Also calculates stats like remaining lessons and required
 * lessons per day to meet the deadline.
 */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CourseProgress } from './course-progress.entity';
import { CreateCourseDto, UpdateCourseDto, CreateCourseProgressDto } from './dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseProgress)
    private readonly progressRepository: Repository<CourseProgress>,
  ) {}

  /** Create a new course */
  async create(userId: string, dto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create({
      userId,
      name: dto.name,
      totalLessons: dto.totalLessons,
      deadline: dto.deadline,
    });
    return this.courseRepository.save(course);
  }

  /** Get all courses for a user, with optional active filter */
  async findAll(userId: string, activeOnly: boolean = true): Promise<Course[]> {
    const where: any = { userId };
    if (activeOnly) where.isActive = true;
    return this.courseRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['progressEntries'],
    });
  }

  /** Get a single course by ID */
  async findOne(userId: string, courseId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, userId },
      relations: ['progressEntries'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  /** Update a course */
  async update(
    userId: string,
    courseId: string,
    dto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.findOne(userId, courseId);
    Object.assign(course, dto);
    return this.courseRepository.save(course);
  }

  /** Delete a course */
  async remove(userId: string, courseId: string): Promise<void> {
    const course = await this.findOne(userId, courseId);
    await this.courseRepository.remove(course);
  }

  /**
   * Log a study session for a course.
   * Each session records which lessons were covered.
   */
  async logProgress(
    userId: string,
    courseId: string,
    dto: CreateCourseProgressDto,
  ): Promise<CourseProgress> {
    // Verify the course exists and belongs to this user
    await this.findOne(userId, courseId);

    const progress = this.progressRepository.create({
      courseId,
      date: dto.date,
      lessonsFrom: dto.lessonsFrom,
      lessonsTo: dto.lessonsTo,
      durationMin: dto.durationMin || null,
      note: dto.note || null,
    });

    return this.progressRepository.save(progress);
  }

  /**
   * Calculate course statistics.
   *
   * - currentLesson: the highest lesson_to across all progress entries
   * - remainingLessons: total - current
   * - daysToDeadline: calendar days until the deadline
   * - requiredLessonsPerDay: remaining / daysToDeadline (pace needed)
   */
  async getStats(
    userId: string,
    courseId: string,
  ): Promise<{
    currentLesson: number;
    remainingLessons: number;
    daysToDeadline: number;
    requiredLessonsPerDay: number;
    totalDurationMin: number;
  }> {
    const course = await this.findOne(userId, courseId);

    // Find the highest lesson completed
    const maxProgress = await this.progressRepository
      .createQueryBuilder('p')
      .select('MAX(p.lessons_to)', 'maxLesson')
      .addSelect('SUM(p.duration_min)', 'totalDuration')
      .where('p.course_id = :courseId', { courseId })
      .getRawOne();

    const currentLesson = parseInt(maxProgress.maxLesson) || 0;
    const remainingLessons = course.totalLessons - currentLesson;

    // Calculate days until deadline
    const deadline = new Date(course.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToDeadline = Math.max(
      0,
      Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const requiredLessonsPerDay =
      daysToDeadline > 0
        ? parseFloat((remainingLessons / daysToDeadline).toFixed(1))
        : remainingLessons;

    return {
      currentLesson,
      remainingLessons,
      daysToDeadline,
      requiredLessonsPerDay,
      totalDurationMin: parseInt(maxProgress.totalDuration) || 0,
    };
  }

  /** Get total study hours this week across all courses */
  async getWeeklyStudyHours(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await this.progressRepository
      .createQueryBuilder('p')
      .innerJoin('p.course', 'c')
      .select('COALESCE(SUM(p.duration_min), 0)', 'total')
      .where('c.user_id = :userId', { userId })
      .andWhere('p.date >= :from', { from: weekAgo.toISOString().split('T')[0] })
      .getRawOne();

    return parseFloat((parseInt(result.total) / 60).toFixed(1)) || 0;
  }
}
