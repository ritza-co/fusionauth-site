import type { FastifyPluginAsync } from "fastify";

import { checkAuthenticated, env, faClient } from "../utils";

const links: FastifyPluginAsync = async (fastify): Promise<void> => {
	fastify.get<{ Params: { id: string } }>(
		"/links/:id/link",
		{
			preValidation: checkAuthenticated,
		},
		async (req, rep) => {
			await req.logOut();
			rep.redirect(
				`${env.FUSIONAUTH_URL}/oauth2/logout?client_id=${env.FUSIONAUTH_CLIENT_ID}&post_logout_redirect_uri=` +
					encodeURI(`http://localhost:3000/auth/idp/${req.params.id}`),
			);
		},
	);

	fastify.get<{ Params: { id: string } }>(
		"/links/:id/unlink",
		{
			preValidation: checkAuthenticated,
		},
		async (req, rep) => {
			const { id } = req.params;

			const link = await faClient.retrieveUserLinksByUserId(
				id,
				req.user?.id ?? "",
			);

			if (link.response.identityProviderLinks?.length) {
				const { identityProviderId, identityProviderUserId, userId } =
					link.response.identityProviderLinks[0];

				if (identityProviderId && identityProviderUserId && userId) {
					await faClient.deleteUserLink(
						identityProviderId,
						identityProviderUserId,
						userId,
					);
				}
			}
			return rep.redirect("/");
		},
	);
};

export default links;
