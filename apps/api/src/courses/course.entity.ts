/**
 * Course Entity — tracks online courses the user is taking.
 *
 * Each course has a name, total number of lessons, and a deadline.
 * Combined with CourseProgress entries, we can calculate:
 * - Current lesson number (how far along)
 * - Remaining lessons
 * - Required lessons per day to finish on time
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { CourseProgress } from './course-progress.entity';
import { LearningLog } from '../learning/learning-log.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  name: string;

  // Total number of lessons in the course
  @Column({ name: 'total_lessons', type: 'int' })
  totalLessons: number;

  // Target date to finish the course
  @Column({ type: 'date' })
  deadline: string;

  // Whether the user is actively working on this course
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // A course has many progress entries (study sessions)
  @OneToMany(() => CourseProgress, (progress) => progress.course)
  progressEntries: CourseProgress[];

  // A course has many learning log entries
  @OneToMany(() => LearningLog, (log) => log.course)
  learningLogs: LearningLog[];
}
