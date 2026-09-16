import {Controller, Inject} from '@tsed/di';
import {Get} from '@tsed/schema';
import {Locals} from '@tsed/platform-params';
import {TicketEntity} from '../../../datasources/Ticket.entity';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';
import {TICKET_REPOSITORY} from '../../../datasources/TicketRepository';
import {Constant} from '@tsed/cli-core';
import {FusionAuthClient} from '@fusionauth/typescript-client';

@Controller('/')
export class FindAllTicketsController {

  @Inject(TICKET_REPOSITORY)
  private ticketRepository: TICKET_REPOSITORY;

  @Constant('envs.FUSIONAUTH_API_KEY')
  private apiKey: string;

  @Constant('envs.FUSIONAUTH_SERVER_URL')
  private baseUrl: string;

  /**
   * Get all tickets
   * @param locals
   */
  @Get()
  async findAll(@Locals() locals: { user: any }): Promise<(Partial<TicketEntity> & { _creator: any }) []> {
    const where: FindOptionsWhere<TicketEntity> = {};
    if (!locals.user?.roles?.includes('agent')) {
      where['creator'] = locals.user.sub;
    }

    // Get all tickets
    const tickets = await this.ticketRepository.find({where, order: {id: 'DESC'}});

    // Retrieve uses from FusionAuth
    const creators = new Map<string, any>();
    const client = new FusionAuthClient(this.apiKey, this.baseUrl);

    for await (const ticket of tickets) {
      if (!creators.has(ticket.creator)) {
        const user = await client.retrieveUser(ticket.creator);
        creators.set(ticket.creator, user.response.user);
      }
    }

    // Return tickets with creator data embedded
    return tickets
      .map(ticket => {
        return {
          id: ticket.id,
          title: ticket.title,
          creator: ticket.creator,
          status: ticket.status,
          created: ticket.created,
          updated: ticket.updated,
          _creator: creators.get(ticket.creator)
        };
      });
  }

}
