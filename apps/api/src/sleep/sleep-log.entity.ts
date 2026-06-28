/**
 * SleepLog Entity — tracks when the user goes to bed, wakes up,
 * how long they slept, and subjective sleep quality (1-5).
 *
 * `duration_min` is computed automatically from bed_time and wake_time
 * using a TypeORM @BeforeInsert / @BeforeUpdate hook, rather than a
 * database-level generated column (which has portability issues).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('sleep_logs')
export class SleepLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign key to the users table
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /**
   * ManyToOne establishes the relationship: many sleep logs belong to one user.
   * @JoinColumn tells TypeORM which column holds the foreign key.
   */
  @ManyToOne(() => User, (user) => user.sleepLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // The date this sleep entry is for (e.g. "2024-01-15")
  @Column({ type: 'date' })
  date: string;

  // The exact time the user went to bed
  @Column({ name: 'bed_time', type: 'timestamp' })
  bedTime: Date;

  // The exact time the user woke up
  @Column({ name: 'wake_time', type: 'timestamp' })
  wakeTime: Date;

  // Calculated field: total sleep duration in minutes
  @Column({ name: 'duration_min', type: 'int', nullable: true })
  durationMin: number;

  /**
   * Subjective quality rating from 1 (terrible) to 5 (excellent).
   * Using 'smallint' saves storage compared to regular 'int'.
   */
  @Column({ type: 'smallint' })
  quality: number;

  // Optional freeform note about the sleep
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * TypeORM lifecycle hook: runs before INSERT and UPDATE.
   * Automatically calculates the sleep duration from bed_time and wake_time.
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateDuration() {
    if (this.bedTime && this.wakeTime) {
      const bed = new Date(this.bedTime).getTime();
      const wake = new Date(this.wakeTime).getTime();
      // Duration in minutes, rounded to the nearest whole number
      this.durationMin = Math.round((wake - bed) / (1000 * 60));
    }
  }
}
