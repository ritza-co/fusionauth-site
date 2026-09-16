import {Command, CommandProvider, Constant} from '@tsed/cli-core';
import {Inject} from '@tsed/di';
import {TICKET_REPOSITORY} from '../datasources/TicketRepository';
import {TicketEntity, TicketStatus} from '../datasources/Ticket.entity';
import {faker} from '@faker-js/faker';
import {FusionAuthClient} from '@fusionauth/typescript-client';

export interface TicketSeedCommandContext {
  count: number;
}

/**
 * Ticket seed command
 *
 * Seeds the database with tickets
 */
@Command({
  name: 'ticket:seed',
  description: 'Seed the database with tickets',
  args: {
    count: {
      type: Number,
      defaultValue: 10,
      description: 'The number of tickets to seed',
    }
  },
  options: {},
  allowUnknownOption: false,
})
export class TicketSeedCommand implements CommandProvider {

  @Constant('envs.FUSIONAUTH_API_KEY')
  private apiKey: string;

  @Constant('envs.FUSIONAUTH_SERVER_URL')
  private baseUrl: string;

  @Constant('envs.FUSIONAUTH_CLIENT_ID')
  private clientId: string;

  @Inject(TICKET_REPOSITORY)
  private ticketRepository: TICKET_REPOSITORY;

  $exec(ctx: TicketSeedCommandContext): any {
    return [
      {
        title: "Seeding tickets",
        task: async () => {
          // Read users from FusionAuth
          const client = new FusionAuthClient(this.apiKey, this.baseUrl);
          const clientResponse = await client.searchUsersByQuery({
            search: {
              query: JSON.stringify({
                "bool": {
                  "must": [{
                    "nested": {
                      "path": "registrations",
                      "query": {
                        "bool": {
                          "must": [{
                            "match": {
                              "registrations.applicationId": this.clientId
                            }
                          }, {
                            "match": {
                              "registrations.roles": "customer"
                            }
                          }]
                        }
                      }
                    }
                  }]
                }
              })
            }
          });

          // Create n tickets
          const {users} = clientResponse.response;
          const tickets: TicketEntity[] = [];
          for (let i = 0; i < ctx.count; i++) {
            const ticket = new TicketEntity();
            ticket.title = faker.lorem.sentence();
            ticket.description = faker.lorem.paragraphs(5);
            ticket.status = faker.helpers.arrayElement(Object.values(TicketStatus)) as TicketStatus;
            ticket.creator = faker.helpers.arrayElement(users).id!;

            // If the ticket not open, add a solution
            if (ticket.status !== TicketStatus.OPEN) {
              ticket.solution = faker.lorem.paragraphs(5);
            }

            tickets.push(ticket);
          }
          return this.ticketRepository.save(tickets);
        }
      }
    ];
  }
}
