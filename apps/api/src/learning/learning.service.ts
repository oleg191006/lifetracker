/**
 * LearningService — business logic for learning log entries.
 *
 * Learning logs capture what the user learned and what's still unclear,
 * creating a personal knowledge journal linked to specific courses.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LearningLog } from './learning-log.entity';
import { CreateLearningLogDto } from './dto';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(
    @InjectRepository(LearningLog)
    private readonly learningRepository: Repository<LearningLog>,
  ) {}

  async create(userId: string, dto: CreateLearningLogDto): Promise<LearningLog> {
    const entry = this.learningRepository.create({
      userId,
      courseId: dto.courseId,
      insight: dto.insight,
      confusion: dto.confusion || null,
      durationMin: dto.durationMin || null,
    });

    const saved = await this.learningRepository.save(entry);
    this.logger.log(`Learning log created for course ${dto.courseId}`);
    return saved;
  }

  async findAll(
    userId: string,
    courseId?: string,
    from?: string,
    to?: string,
  ): Promise<LearningLog[]> {
    const qb = this.learningRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.course', 'course')
      .where('l.user_id = :userId', { userId })
      .orderBy('l.created_at', 'DESC');

    if (courseId) {
      qb.andWhere('l.course_id = :courseId', { courseId });
    }

    if (from) {
      qb.andWhere('l.date >= :from', { from });
    }

    if (to) {
      qb.andWhere('l.date <= :to', { to });
    }

    return qb.getMany();
  }
}
