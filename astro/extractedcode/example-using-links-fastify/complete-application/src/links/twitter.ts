import https from "node:https";
import path from "node:path";
import qs from "qs";
import TwitterApi, { type TwitterApiTokens } from "twitter-api-v2";

import { env } from "../utils";
import type { LinkDefinition } from "./";

export type TwitterMetadata = {
	text?: string; // Tweet text
};

export const TwitterLinkDefinition: LinkDefinition<TwitterMetadata> = {
	id: "twitter",
	providerId: env.TWITTER_PROVIDER_ID,
	name: "Twitter",
	icon: "bi bi-twitter",
	url: "https://twitter.com",
	color: "#1da1f2",
	upload: async (token, file, metadata?: TwitterMetadata) => {
		try {
			const { oauth_token, oauth_token_secret } = qs.parse(token);
			const twitterClient = new TwitterApi(
				{
					appKey: env.TWITTER_API_KEY,
					appSecret: env.TWITTER_API_SECRET,
					accessToken: oauth_token,
					accessSecret: oauth_token_secret,
				} as TwitterApiTokens,
				{ httpAgent: new https.Agent({ keepAlive: false }) },
			);

			const mediaId = await twitterClient.v1.uploadMedia(path.resolve(file));

			// Use custom tweet text from metadata if provided, or fall back to default
			const { text = "Check out my video!" } = metadata ?? {};

			const tweet = await twitterClient.v2.tweet(text, {
				media: {
					media_ids: [mediaId],
				},
			});

			return `https://twitter.com/i/statuses/${tweet.data.id}`;
		} catch (e) {
			// Log the original error for debugging purposes
			console.error("Twitter upload error:", e);

			// Determine the type of error and provide a user-friendly message
			if (e instanceof Error) {
				// Check for specific error types
				if (e.message.includes("authentication")) {
					throw new Error(
						"Authentication failed with Twitter. Please try reconnecting your account.",
					);
				} else if (e.message.includes("rate limit")) {
					throw new Error(
						"Twitter rate limit exceeded. Please try again later.",
					);
				} else if (e.message.includes("media")) {
					throw new Error(
						"There was a problem with your media file. Please try a different file.",
					);
				}
			}

			// Generic error message that doesn't expose internal details
			throw new Error("Failed to post to Twitter. Please try again later.");
		}
	},
};
