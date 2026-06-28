/**
 * User Entity — represents a single user in the system.
 *
 * In this app there's only ONE user (the admin), but we still use a proper
 * entity with relations so the architecture is extensible.
 *
 * TypeORM decorators:
 * - @Entity()       → tells TypeORM this class maps to a database table
 * - @PrimaryGeneratedColumn('uuid') → auto-generates a UUID primary key
 * - @Column()       → maps a class property to a table column
 * - @CreateDateColumn() → auto-sets the timestamp when the row is created
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SleepLog } from '../sleep/sleep-log.entity';
import { DailyLog } from '../daily/daily-log.entity';
import { EnergyCheck } from '../energy/energy-check.entity';
import { Course } from '../courses/course.entity';
import { LearningLog } from '../learning/learning-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  /**
   * Password is stored as a bcrypt hash, NEVER in plain text.
   * The `select: false` option means this column is excluded from
   * queries by default — you must explicitly `.addSelect('user.password')`
   * when you need to verify the password (e.g., during login).
   */
  @Column({ type: 'varchar', select: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ── Relations ─────────────────────────────────────────────────
  // OneToMany means "this user has many sleep logs"
  // The second argument is a function that returns the inverse relation
  @OneToMany(() => SleepLog, (log) => log.user)
  sleepLogs: SleepLog[];

  @OneToMany(() => DailyLog, (log) => log.user)
  dailyLogs: DailyLog[];

  @OneToMany(() => EnergyCheck, (check) => check.user)
  energyChecks: EnergyCheck[];

  @OneToMany(() => Course, (course) => course.user)
  courses: Course[];

  @OneToMany(() => LearningLog, (log) => log.user)
  learningLogs: LearningLog[];
}
