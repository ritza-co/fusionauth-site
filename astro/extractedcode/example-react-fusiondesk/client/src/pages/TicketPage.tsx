import {FC} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {Ticket} from '../entity/Ticket';
import {useForm} from 'react-hook-form';
import {useFusionAuth} from '@fusionauth/react-sdk';
import {hasRole} from '../utils/hasRole';

/**
 * Ticket page
 *
 * Displays a ticket and allows the user to edit it
 * @constructor
 */
export const TicketPage: FC = () => {
  const navigate = useNavigate();
  const {ticket} = useLoaderData() as { ticket: Ticket };

  const {user} = useFusionAuth();

  const {register, handleSubmit} = useForm<Ticket>({
    defaultValues: ticket
  });
  const onSubmit = (data: any) => {
    return fetch(`http://localhost:8083/api/tickets/${ticket.id ?? ''}`, {
      method: ticket.id ? 'PATCH' : 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      credentials: 'include'
    })
      .finally(() => {
        navigate('/tickets', {replace: true});
      });
  }

  const updateStatus = (e: any, status: string) => {
    e.preventDefault();
    return onSubmit({
      id: ticket.id,
      status: status
    });
  }

  return (
    <div className="p-4 mt-8 mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Ticket {ticket.id &&
        <span>#{ticket.id}</span>}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input type="text" placeholder="Title" className="input input-bordered w-full"
                 {...register("title")}/>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea className="textarea" {...register("description")}></textarea>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Solution</span>
          </label>
          {hasRole(user, 'agent')
            ? <textarea className="textarea" {...register("solution")}></textarea>
            : <article className="whitespace-pre-wrap">{ticket.solution ?? 'No solution provided'}</article>
          }
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <span>{ticket.status}</span>
        </div>

        <div className="flex space-x-2">
          {ticket.status !== 'closed' &&
            <button className="btn btn-primary" type="submit">Save</button>
          }

          <button className="btn" type="button" onClick={() => navigate('/tickets', {replace: true})}>Cancel</button>

          <div className="grow text-right">
            {ticket.status === 'open' && hasRole(user, 'agent') &&
              <button className="btn btn-success" type="button" onClick={(e) => updateStatus(e, 'solved')}>Mark as
                Solved</button>
            }
            {ticket.status === 'solved' && user?.sub === ticket.creator &&
              <div className="space-x-2">
                <button className="btn btn-success" type="button" onClick={(e) => updateStatus(e, 'closed')}>Accept
                  solution
                </button>
                <button className="btn btn-warning" type="button" onClick={(e) => updateStatus(e, 'open')}>Reject
                  solution
                </button>
              </div>
            }
          </div>
        </div>
      </form>
    </div>
  );
};
