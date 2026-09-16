import {Get, Integer} from '@tsed/schema';
import {PathParams} from '@tsed/platform-params';
import {TicketEntity} from '../../../datasources/Ticket.entity';
import {Controller, Inject} from '@tsed/di';
import {TICKET_REPOSITORY} from '../../../datasources/TicketRepository';

@Controller('/:id')
export class FindTicketController {

  @Inject(TICKET_REPOSITORY)
  private ticketRepository: TICKET_REPOSITORY;

  /**
   * Get a single ticket
   * @param id
   */
  @Get()
  find(@PathParams("id") @Integer() id: number): Promise<TicketEntity> {
    return this.ticketRepository.findOneByOrFail({id});
  }

}
