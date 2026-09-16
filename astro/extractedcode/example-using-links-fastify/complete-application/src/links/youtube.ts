import { createReadStream } from "node:fs";
import path from "node:path";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { env } from "../utils";
import type { LinkDefinition } from "./";

export type YouTubeMetadata = {
	title?: string; // Video title
	description?: string; // Video description
	privacyStatus?: "public" | "unlisted" | "private"; // Video privacy setting
};

export const YoutubeLinkDefinition: LinkDefinition<YouTubeMetadata> = {
	id: "youtube",
	providerId: env.GOOGLE_PROVIDER_ID,
	name: "Youtube",
	icon: "bi bi-youtube",
	url: "https://www.youtube.com",
	color: "#ff0000",
	upload: async (token, file, metadata?: YouTubeMetadata) => {
		try {
			const authClient = new OAuth2Client({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				redirectUri: env.FUSIONAUTH_REDIRECT_URI,
			});
			authClient.setCredentials({
				refresh_token: token,
			});

			google.options({ auth: authClient });

			// Use custom metadata if provided, or fall back to defaults
			const {
				title = "Video Upload",
				description = "Uploaded video",
				privacyStatus = "private",
			} = metadata ?? {};

			const insert = await google.youtube("v3").videos.insert({
				part: ["snippet", "status"],
				requestBody: {
					snippet: {
						title: title,
						description: description,
					},
					status: {
						privacyStatus: privacyStatus,
					},
				},
				media: {
					body: createReadStream(path.resolve(file)),
				},
			});

			return `https://www.youtube.com/watch?v=${insert.data.id}`;
		} catch (e) {
			// Log the original error for debugging purposes
			console.error("YouTube upload error:", e);

			// Determine the type of error and provide a user-friendly message
			if (e instanceof Error) {
				// Check for specific error types
				if (
					e.message.includes("authentication") ||
					e.message.includes("auth")
				) {
					throw new Error(
						"Authentication failed with YouTube. Please try reconnecting your account.",
					);
				} else if (e.message.includes("quota") || e.message.includes("limit")) {
					throw new Error("YouTube quota exceeded. Please try again later.");
				} else if (
					e.message.includes("invalid") &&
					e.message.includes("video")
				) {
					throw new Error(
						"The video format is not supported by YouTube. Please try a different file.",
					);
				} else if (e.message.includes("size")) {
					throw new Error(
						"The video file is too large for YouTube. Please try a smaller file.",
					);
				}
			}

			// Generic error message that doesn't expose internal details
			throw new Error("Failed to upload to YouTube. Please try again later.");
		}
	},
};
