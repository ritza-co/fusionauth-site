import {Navigate, Outlet} from 'react-router-dom';
import {useFusionAuth} from '@fusionauth/react-sdk';
import {FC} from 'react';

/**
 * ProtectedRoutes component
 *
 * This component is used to protect routes.
 * Any route that is a child of this component will be protected.
 * @constructor
 */
export const ProtectedRoutes: FC = () => {
  const {isLoading, isAuthenticated} = useFusionAuth();

  if (isLoading) return null;

  return (
    isAuthenticated ? <Outlet/> : <Navigate to={'/'} replace={true}/>
  );
};
