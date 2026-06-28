/**
 * CourseProgress Entity — logs individual study sessions for a course.
 *
 * Each entry records which lessons were covered (from → to),
 * how long the session lasted, and optional notes.
 *
 * Example: "Today I completed lessons 15-18 in 45 minutes"
 * → lessons_from: 15, lessons_to: 18, duration_min: 45
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('course_progress')
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.progressEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'date' })
  date: string;

  // The first lesson number covered in this session
  @Column({ name: 'lessons_from', type: 'int' })
  lessonsFrom: number;

  // The last lesson number covered in this session
  @Column({ name: 'lessons_to', type: 'int' })
  lessonsTo: number;

  // How long the study session lasted (in minutes)
  @Column({ name: 'duration_min', type: 'int', nullable: true })
  durationMin: number | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
