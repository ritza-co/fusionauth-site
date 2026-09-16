import React, {FC} from 'react';
import {Tickets} from '../entity/Ticket';
import {Link} from 'react-router-dom';
import {useQuery} from 'react-query';
import {Loading} from '../components/Loading';
import {Avatar} from '../components/Avatar';

/**
 * Tickets page
 *
 * This page is used to display all tickets.
 * @constructor
 */
export const TicketsPage: FC = () => {
  const {isLoading, isError, data, error} = useQuery<Tickets, Error>('tickets', () => {
    return fetch('http://localhost:8083/api/tickets', {
      credentials: 'include'
    })
      .then(response => response.json() as Promise<Tickets>);
  }, {
    refetchInterval: 5000,
  })

  if (isLoading) return <Loading/>

  if (isError) return <div>Error: {error?.message}</div>

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
        <tr>
          <th></th>
          <th>Title</th>
          <th>Creator</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {data?.map((ticket) =>
          <tr key={ticket.id}>
            <th><Link to={`${ticket.id}`}>{ticket.id}</Link></th>
            <td><Link to={`${ticket.id}`}>{ticket.title}</Link></td>
            <td>
              <div className="flex items-center space-x-3">
                <Avatar name={ticket._creator.firstName + ' ' + ticket._creator.lastName}
                        url={ticket._creator.imageUrl}/>
                <div>{ticket._creator.firstName} {ticket._creator.lastName}</div>
              </div>
            </td>
            <td>{ticket.status}</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
};
