import {Controller} from '@tsed/di';
import {UpdateTicketController} from './ticket/UpdateTicketController';
import {FindAllTicketsController} from './ticket/FindAllTicketsController';
import {FindTicketController} from './ticket/FindTicketController';
import {CreateTicketController} from './ticket/CreateTicketController';

/**
 * Ticket controller
 *
 * Allows users to create tickets and agents to manage them
 */
@Controller({
  path: '/tickets',
  children: [
    FindAllTicketsController,
    FindTicketController,
    CreateTicketController,
    UpdateTicketController
  ]
})
export class TicketController {
}
