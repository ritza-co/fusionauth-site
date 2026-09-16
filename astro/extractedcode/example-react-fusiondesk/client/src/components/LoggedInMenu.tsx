import React, {FC} from 'react';
import {RequireAuth, useFusionAuth} from '@fusionauth/react-sdk';
import {Link} from 'react-router-dom';
import {Avatar} from './Avatar';

/**
 * LoggedInMenu component
 *
 * This component is used to display the logged-in menu.
 * It is used in the Header component.
 * @constructor
 */
export const LoggedInMenu: FC = () => {
  const {user, isAuthenticated, isLoading, logout} = useFusionAuth();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <RequireAuth>
      <div className="flex-none gap-2">
        <div>
          {user.roles?.map((role: string) => {
            return (<div className="badge badge-lg badge-ghost" key={role}>{role}</div>)
          })}
        </div>

        <Link to={'tickets/new'} className="btn">Create Ticket</Link>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <Avatar name={user.given_name + ' ' + user.family_name} url={user.picture}/>
          </label>
          <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
            <li>
              <Link className="justify-between" to={'profile'}>
                Profile
              </Link>
            </li>
            <li>
              {/* The out-of-the-box Logout button. You may customize how logout is performed by */}
              {/* utilizing the `logout` method supplied by the FusionAuthContext */}
              <button onClick={() => logout()}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </RequireAuth>
  );
}
