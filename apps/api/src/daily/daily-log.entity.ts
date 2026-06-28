/**
 * DailyLog Entity — the user's daily productivity self-assessment.
 *
 * Three inputs produce a composite score:
 *   plan_pct (0-100) — what percentage of the planned tasks got done
 *   focus    (1-3)   — subjective focus level
 *   energy   (1-2)   — end-of-day energy level
 *
 * Score formula: score = (plan_pct / 100) * 5 + focus + energy
 * Maximum possible score: (100/100)*5 + 3 + 2 = 10
 *
 * The date column has a UNIQUE constraint — only one daily log per day.
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
  Unique,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('daily_logs')
@Unique(['userId', 'date'])
export class DailyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.dailyLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  // Percentage of planned tasks completed (0 to 100)
  @Column({ name: 'plan_pct', type: 'smallint' })
  planPct: number;

  // Focus level: 1 = low, 2 = medium, 3 = high
  @Column({ type: 'smallint' })
  focus: number;

  // Energy at end of day: 1 = drained, 2 = still going
  @Column({ type: 'smallint' })
  energy: number;

  /**
   * Computed productivity score.
   * Stored as numeric(4,2) which means up to 4 digits, 2 after decimal.
   * Example values: 7.50, 10.00, 3.25
   */
  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Lifecycle hook: calculates the score before saving.
   * This keeps the logic in one place (the entity) rather than
   * duplicating it in services or controllers.
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateScore() {
    if (this.planPct != null && this.focus != null && this.energy != null) {
      this.score = parseFloat(
        ((this.planPct / 100) * 5 + this.focus + this.energy).toFixed(2),
      );
    }
  }
}
