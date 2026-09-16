/**
 * Ticket entity
 */
export interface Ticket {
  id: number;
  title: string;
  description: string;
  solution?: string;
  status: 'open' | 'solved' | 'closed';
  creator: string;
  _creator?: any;
  created: Date;
  updated?: Date;
}

export type Tickets = Ticket[];
