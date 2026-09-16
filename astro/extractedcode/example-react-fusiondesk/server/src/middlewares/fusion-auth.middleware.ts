import {Middleware, MiddlewareMethods} from '@tsed/platform-middlewares';
import {Context, Locals} from '@tsed/platform-params';
import {Unauthorized} from '@tsed/exceptions';
import {Constant, OnInit} from "@tsed/di";
import * as jose from "jose";

/**
 * FusionAuth middleware
 *
 * Checks if the user is logged in and has a valid access token
 */
@Middleware()
export class FusionAuthMiddleware implements MiddlewareMethods, OnInit {

  @Constant('envs.FUSIONAUTH_SERVER_URL')
  private baseUrl: string;

  @Constant('envs.FUSIONAUTH_CLIENT_ID')
  private clientId: string;

  @Constant('envs.FUSIONAUTH_ISSUER')
  private issuer: string;

  private jwks: ReturnType<typeof jose.createRemoteJWKSet>;

  async $onInit(): Promise<void> {
    this.jwks = jose.createRemoteJWKSet(new URL(`${this.baseUrl}/.well-known/jwks.json`));
  }

  async use(@Context() $ctx: Context, @Locals() locals: any) {
    const access_token = $ctx.request.cookies['app.at'];

    if (access_token) {
      try {
        const {payload} = await jose.jwtVerify(access_token, this.jwks, {
          issuer: this.issuer,
          audience: this.clientId,
        });
        // Add the payload including roles and user id to the locals
        locals.user = payload;
      } catch (e: unknown) {
        if (e instanceof jose.errors.JOSEError) {
          this.throwAuthError();
        } else {
          throw e;
        }
      }
    } else {
      this.throwAuthError()
    }
  }

  throwAuthError() {
    throw new Unauthorized('You are not authorized to access this resource');
  }

}
