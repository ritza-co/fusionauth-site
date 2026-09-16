import {FusionAuthConfig} from '@fusionauth/react-sdk';

export const config: FusionAuthConfig = {
  clientID: process.env.REACT_APP_FUSIONAUTH_CLIENT_ID!, // The client ID of your FusionAuth application, e.g., '90ba1caf-c0c1-b30a-af38-3ed438df9fc0'
  serverUrl: process.env.REACT_APP_FUSIONAUTH_SERVER_URL!,  // The URL of your server that performs the token exchange
  redirectUri: process.env.REACT_APP_FUSIONAUTH_REDIRECT_URL!, // Where to redirect to your React client after authentication
  loginPath: process.env.REACT_APP_FUSIONAUTH_LOGIN_PATH,
  logoutPath: process.env.REACT_APP_FUSIONAUTH_LOGOUT_PATH,
  registerPath: process.env.REACT_APP_FUSIONAUTH_REGISTER_PATH,
  tokenRefreshPath: process.env.REACT_APP_FUSIONAUTH_TOKEN_REFRESH_PATH,
  mePath: process.env.REACT_APP_FUSIONAUTH_ME_PATH,
};
