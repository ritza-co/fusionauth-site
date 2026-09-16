import React, {FC} from 'react';
import {initials} from '../utils/initials';

interface AvatarProps {
  url?: string;
  name: string;
}

/**
 * Avatar component
 *
 * This component is used to display the avatar of a user.
 *
 * @param url URL to the image
 * @param name Name of the user
 * @constructor FC<AvatarProps>
 */
export const Avatar: FC<AvatarProps> = ({url, name}) => {

  if (!url && !name) return null;

  return (
    <div className="avatar placeholder">
      <div className="bg-neutral-focus text-neutral-content w-10 h-10 rounded-full">
        {url ? (
          <img src={url} alt="Avatar"/>
        ) : (
          <span>{initials(name)}</span>
        )}
      </div>
    </div>
  );
}
