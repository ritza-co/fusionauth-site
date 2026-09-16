import type { FastifyPluginAsync } from "fastify";
import { fastifyAuthenticator } from "../plugins/auth";

import { env } from "../utils";

const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
	fastify.get(
		"/auth/login",
		fastifyAuthenticator.authenticate("fusionauth", {
			authInfo: false,
			failWithError: true,
		}),
	);

	fastify.get("/auth/logout", async (request, reply) => {
		await request.logOut();
		reply.redirect(
			`${env.FUSIONAUTH_URL}/oauth2/logout?client_id=${env.FUSIONAUTH_CLIENT_ID}`,
		);
	});

	fastify.get(
		"/auth/callback",
		fastifyAuthenticator.authenticate("fusionauth", {
			authInfo: false,
			successRedirect: "/",
			failWithError: true,
		}),
	);

	fastify.get(
		"/auth/idp/:providerId",
		fastifyAuthenticator.authenticate("fusionauth", {
			authInfo: false,
			successRedirect: "/",
			failWithError: true,
		}),
	);
};

export default auth;
