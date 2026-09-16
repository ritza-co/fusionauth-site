import {Controller, Inject} from '@tsed/di';
import {TICKET_REPOSITORY} from '../../../datasources/TicketRepository';
import {Integer, Patch} from '@tsed/schema';
import {BodyParams, Locals, PathParams} from '@tsed/platform-params';
import {DeepPartial} from 'typeorm/common/DeepPartial';
import {TicketEntity, TicketStatus} from '../../../datasources/Ticket.entity';

@Controller('/')
export class UpdateTicketController {

  @Inject(TICKET_REPOSITORY)
  private ticketRepository: TICKET_REPOSITORY;

  /**
   * Update a ticket
   * @param id
   * @param ticketInput
   * @param locals
   */
  @Patch('/:id')
  async update(@PathParams("id") @Integer() id: number, @BodyParams() ticketInput: DeepPartial<TicketEntity>, @Locals() locals: {
    user: any
  }): Promise<TicketEntity> {
    let filteredTicketInput: DeepPartial<TicketEntity> = {
      title: ticketInput.title,
      description: ticketInput.description,
      status: ticketInput.status,
    };
    if (locals.user.roles.includes('agent')) {
      filteredTicketInput = {
        ...filteredTicketInput,
        solution: ticketInput.solution,
      };
    } else if (ticketInput.status !== TicketStatus.OPEN && ticketInput.status !== TicketStatus.CLOSED)
      throw new Error('You are not allowed to change the status of the ticket');

    const ticket = await this.ticketRepository.findOneByOrFail({id});
    this.ticketRepository.merge(ticket, filteredTicketInput);
    return this.ticketRepository.save(ticket);
  }

}
