import React from 'react';
import {Link, Outlet} from 'react-router-dom';
import {Footer} from '../components/Footer';
import {FusionAuthProviderWithRedirectHandling} from '../FusionAuthProviderWithRedirectHandling';
import {LoggedInMenu} from '../components/LoggedInMenu';
import fusionDeskDarkLogo from '../assets/fusion_desk_logo_dark.svg';
import fusionDeskLogo from '../assets/fusion_desk_logo.svg';

/**
 * AppLayout component
 * @constructor
 */
export const AppLayout: React.FC = () => {

  return (
    <FusionAuthProviderWithRedirectHandling>
      <div className="min-h-full bg-base-200 flex flex-col">
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <Link className="btn btn-ghost normal-case text-xl" to={''}>
              <picture>
                <source srcSet={fusionDeskDarkLogo} media="(prefers-color-scheme: dark)"/>
                <source srcSet={fusionDeskLogo}
                        media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"/>
                <img src={fusionDeskLogo} className="h-10 max-w-none" alt="Fusion Desk Logo"/>
              </picture>
              <span className={'pl-2'}>
                                Fusion Desk
                            </span>
            </Link>
          </div>
          <LoggedInMenu/>
        </div>

        <div className="grow">
          <Outlet/>
        </div>
        <Footer/>
      </div>
    </FusionAuthProviderWithRedirectHandling>
  )
};
