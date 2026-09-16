import {FC} from 'react';
import {useFusionAuth} from '@fusionauth/react-sdk';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAt, faPhone} from '@fortawesome/free-solid-svg-icons'
import {initials} from '../utils/initials';

/**
 * ProfilePage component
 *
 * This component is used to display the profile page.
 * @constructor
 */
export const ProfilePage: FC = () => {
  const {user} = useFusionAuth();

  return (
    <div className="p-4 mt-8 w-full">
      <div className="card mx-auto w-96 bg-base-100 shadow-xl">
        {user.picture ? (
          <figure><img src={user.picture} className="w-96 h-96" alt="Avatar"/></figure>
        ) : (
          <figure className="bg-neutral-focus text-neutral-content w-96 h-96">
            <span className="text-8xl">{initials(user.given_name + ' ' + user.family_name)}</span>
          </figure>
        )}
        <div className="card-body">
          <h2 className="card-title">{user.given_name} {user.family_name}</h2>

          <table>
            <tbody>
            <tr>
              <td><FontAwesomeIcon icon={faAt}/></td>
              <td>{user.email}</td>
            </tr>
            {user.phone_number &&
              <tr>
                <td><FontAwesomeIcon icon={faPhone}/></td>
                <td>{user.phone_number}</td>
              </tr>
            }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
