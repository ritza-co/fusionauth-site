import type { FastifyPluginAsync } from "fastify";

import { LINKS } from "../links";
import { ALLOWED_MIME_TYPES, faClient } from "../utils";

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
	fastify.get("/", async (request, reply) => {
		if (!request.isAuthenticated()) {
			return reply.view("login.ejs");
		}

		// Check if the user has any links
		const identityProviderLinks = await faClient.retrieveUserLinksByUserId(
			"",
			request.user?.id ?? "",
		);

		const links = LINKS.map((social) => ({
			...social,
			disabled: !identityProviderLinks.response.identityProviderLinks?.some(
				(link) => link.identityProviderId === social.providerId,
			),
		}));

		return reply.view("root.ejs", {
			user: request.user?.displayName,
			links,
			mimeTypes: ALLOWED_MIME_TYPES,
		});
	});
};

export default root;
