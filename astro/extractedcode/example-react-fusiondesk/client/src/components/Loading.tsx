import {FC} from 'react';

/**
 * Loading component
 *
 * This component is used to display a loading spinner.
 * @constructor
 */
export const Loading: FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <svg width="96" height="96" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
          fill="white">
          <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12"
                            repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );
}
