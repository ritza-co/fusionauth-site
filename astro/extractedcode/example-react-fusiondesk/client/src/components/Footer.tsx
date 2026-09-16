import React from 'react';
import fusionAuthLogo from '../assets/fusion_auth_logo.svg';
import fusionAuthDarkLogo from '../assets/fusion_auth_logo_dark.svg';

/**
 * Footer component
 *
 * This component is used to display the footer.
 * @constructor
 */
export const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <div className="flex">
        <p className="whitespace-nowrap">Powered by</p>
        <picture>
          <source srcSet={fusionAuthDarkLogo} media="(prefers-color-scheme: dark)"/>
          <source srcSet={fusionAuthLogo} media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"/>
          <img src={fusionAuthLogo} className="h-6 max-w-none" alt="FusionAuth Logo"/>
        </picture>
      </div>
    </footer>
  );
}
