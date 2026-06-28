/**
 * LearningLog Entity — captures what the user learned and what's still unclear.
 *
 * This follows the "Feynman technique" approach:
 * - `insight`: write what you learned in your own words (forces understanding)
 * - `confusion`: note what's still unclear (targets future study)
 *
 * Linked to a specific course so learning can be tracked per-course.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Course } from '../courses/course.entity';

@Entity('learning_logs')
export class LearningLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.learningLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.learningLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // Defaults to today's date via the database
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  // The key thing the user learned, written in their own words
  @Column({ type: 'text' })
  insight: string;

  // What is still unclear or confusing (optional)
  @Column({ type: 'text', nullable: true })
  confusion: string | null;

  // How long the study session lasted
  @Column({ name: 'duration_min', type: 'int', nullable: true })
  durationMin: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
