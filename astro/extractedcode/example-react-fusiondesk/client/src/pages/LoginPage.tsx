import React, {FC, useEffect} from 'react';
import {useFusionAuth,} from '@fusionauth/react-sdk';
import {useNavigate} from 'react-router-dom';

/**
 * LoginPage component
 *
 * This page is displayed if the user is not authenticated.
 * It shows a login and a register button.
 * @constructor
 */
export const LoginPage: FC = () => {
  const navigate = useNavigate();

  // Pull loading/authentication state out of FusionAuth context
  const {isAuthenticated, isLoading, login, register} = useFusionAuth();

  // If the user is authenticated, redirect them to the `tickets` page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tickets');
    }
  }, [isAuthenticated, navigate])

  // Check if the user is authenticated or if the authentication state is still loading
  if (isAuthenticated || isLoading) {
    return null;
  }

  // If the user is not authenticated, show the login and register buttons
  return (
    <div className="hero mt-16">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome</h1>
          <p className="py-6">Welcome to the FusionDesk example app.</p>

          <div className="flex flex-col w-full border-opacity-50">
            {/* We use the FusionAuth `login` method to redirect to the OAuth login page */}
            {/* If you don't need to customize the login, you could use the out-of-box Login button. */}
            <button onClick={() => login()} className="btn btn-primary">Login</button>
            <div className="divider">OR</div>
            {/* We use the FusionAuth `register` method to redirect to the OAuth login page */}
            {/* If you don't need to customize the login, you could use the out-of-box Register button. */}
            <button onClick={() => register()} className="btn btn-primary">Register Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};
