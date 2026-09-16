import {IFusionAuthContext} from '@fusionauth/react-sdk/dist/providers/FusionAuthProvider';

/**
 * Check if the user has the specified role
 * @param user User object
 * @param role Role to check
 */
export const hasRole = (user: IFusionAuthContext['user'], role: string) => {
  return user && user.roles && user.roles.includes(role);
}
