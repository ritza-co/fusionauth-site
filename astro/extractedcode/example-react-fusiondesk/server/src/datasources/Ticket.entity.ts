import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {MaxLength, Property, Required} from '@tsed/schema';

/**
 * Ticket status
 */
export enum TicketStatus {
  OPEN = 'open',
  SOLVED = 'solved',
  CLOSED = 'closed'
}

/**
 * Ticket entity
 *
 * Represents a ticket in the database
 */
@Entity()
export class TicketEntity {
  @PrimaryGeneratedColumn()
  @Property()
  id: number;

  @Column()
  @MaxLength(255)
  @Required()
  title: string;

  @Column({
    type: 'text'
  })
  @Required()
  description: string;

  @Column({
    type: 'text',
    nullable: true
  })
  @Property()
  solution: string;

  @Column({
    type: 'simple-enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN
  })
  @Property()
  status: TicketStatus;

  @Column()
  @Property()
  creator: string;

  @CreateDateColumn({default: () => 'CURRENT_TIMESTAMP'})
  @Property()
  created: Date;

  @UpdateDateColumn()
  @Property()
  updated: Date;
}
