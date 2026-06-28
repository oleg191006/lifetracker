/**
 * EnergyCheck Entity — periodic energy level check-ins throughout the day.
 *
 * The user logs their current energy level (1-10) at various times.
 * Over time, this data reveals patterns like:
 * - Peak energy hours
 * - Energy dips after lunch
 * - How sleep quality affects next-day energy
 *
 * The `checked_at` timestamp auto-defaults to NOW() so the user
 * doesn't need to manually enter the time.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('energy_checks')
export class EnergyCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.energyChecks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Timestamp of when the check-in was recorded.
   * Defaults to the current time via the database.
   */
  @Column({
    name: 'checked_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  checkedAt: Date;

  // Energy level from 1 (exhausted) to 10 (peak energy)
  @Column({ type: 'smallint' })
  level: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;
}
