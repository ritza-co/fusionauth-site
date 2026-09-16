import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { OAuth2Strategy } from "remix-auth-oauth2";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
    new OAuth2Strategy(
        {
            authorizationURL: `${process.env.AUTH_URL}/authorize`,
            tokenURL: `${process.env.AUTH_URL}/token`,
            clientID: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || "",
            callbackURL: process.env.AUTH_CALLBACK_URL || "",

        },
        async ({ accessToken, refreshToken, extraParams, profile, context }) => {
            // here you can use the params above to get the user and return it
            // what you do inside this and how you find the user is up to you
	    // This function is MANDATORY for the system to work, and would be the
            // main cause of being redirected to the /error route
            console.log("Verified by FusionAuth!")
            // console.log(`ACCESS TOKEN: ${accessToken}`);
            // console.log(`REFRESH TOKEN: ${refreshToken}`)
            // return await getUser(
            //     accessToken,
            //     refreshToken,
            //     extraParams,
            //     profile,
            //     context
            // );
        }
    ),
    // this is optional, but if you setup more than one OAuth2 instance you will
    // need to set a custom name to each one
    "FusionAuth"
);

export async function validateCredentials() { }
