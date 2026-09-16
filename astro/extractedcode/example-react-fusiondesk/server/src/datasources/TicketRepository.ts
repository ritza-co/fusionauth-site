import {SqliteDataSource} from './SqliteDatasource';
import {TicketEntity} from './Ticket.entity';
import {registerProvider} from '@tsed/di';

/**
 * Ticket repository
 *
 * Provides access to the ticket database
 */
export const TicketRepository = SqliteDataSource.getRepository(TicketEntity);
export const TICKET_REPOSITORY = Symbol.for('TicketRepository');
export type TICKET_REPOSITORY = typeof TicketRepository;

registerProvider({
  provide: TICKET_REPOSITORY,
  useValue: TicketRepository
})
