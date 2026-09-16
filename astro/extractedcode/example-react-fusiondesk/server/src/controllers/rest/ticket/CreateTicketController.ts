import {Controller, Inject} from '@tsed/di';
import {Post} from '@tsed/schema';
import {BodyParams, Locals} from '@tsed/platform-params';
import {DeepPartial} from 'typeorm/common/DeepPartial';
import {TicketEntity} from '../../../datasources/Ticket.entity';
import {TICKET_REPOSITORY} from '../../../datasources/TicketRepository';

@Controller('/')
export class CreateTicketController {

  @Inject(TICKET_REPOSITORY)
  private ticketRepository: TICKET_REPOSITORY;

  /**
   * Create a new ticket
   * @param ticket
   * @param locals
   */
  @Post('/')
  create(@BodyParams() ticket: DeepPartial<TicketEntity>, @Locals() locals: { user: any }): Promise<TicketEntity> {
    const ticketEntity = this.ticketRepository.create();
    this.ticketRepository.merge(ticketEntity, {
      title: ticket.title,
      description: ticket.description,
    });
    ticketEntity.creator = locals.user.sub;
    return this.ticketRepository.save(ticketEntity);
  }

}
