import * as fs from "node:fs";
import { unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import type { FastifyPluginAsync } from "fastify";

import { LINKS } from "../links";
import { ALLOWED_MIME_TYPES, checkAuthenticated, faClient } from "../utils";

const file: FastifyPluginAsync = async (fastify): Promise<void> => {
	fastify.post(
		"/upload",
		{
			preValidation: checkAuthenticated,
		},
		async (req, rep) => {
			const data = await req.file({
				limits: {
					fileSize: 25 * 1024 * 1024, // 25MB limit
				},
			});

			if (!data) {
				return rep.status(400).send({
					error: "No file provided",
				});
			}

			// Validate file type
			if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
				return rep.status(400).send({
					error: "Invalid file type. Only video files are allowed.",
					allowedTypes: ALLOWED_MIME_TYPES,
				});
			}

			const newFileName = `${Date.now()}-${data.filename}`;

			await pipeline(data.file, fs.createWriteStream(`./files/${newFileName}`));

			req.session.set("file", `./files/${newFileName}`);

			rep.send({
				file: newFileName,
			});
		},
	);

	fastify.post<{
		Body: { links: string[]; metadata?: Record<string, object> };
	}>(
		"/upload/post",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						links: {
							type: "array",
							items: {
								type: "string",
							},
						},
						metadata: {
							type: "object",
							properties: {
								twitter: {
									type: "object",
									properties: {
										text: { type: "string" },
									},
								},
								youtube: {
									type: "object",
									properties: {
										title: { type: "string" },
										description: { type: "string" },
										privacyStatus: {
											type: "string",
											enum: ["public", "unlisted", "private"],
										},
									},
								},
							},
						},
					},
				},
			},
			preValidation: checkAuthenticated,
		},
		async (req, rep) => {
			const file = req.session.get("file") as string;

			if (!file) {
				return rep.status(400).send({
					message: "No file uploaded",
				});
			}

			const { links, metadata = {} } = req.body;

			if (!links.length) {
				return rep.status(400).send({
					message: "No links selected",
				});
			}

			const activeLinks = LINKS.filter((social) => links.includes(social.id));

			const promises = activeLinks.map(async (social) => {
				return await faClient
					.retrieveUserLinksByUserId(social.providerId, req.user?.id ?? "")
					.then((response) => {
						if (!response.response.identityProviderLinks?.length) {
							return;
						}

						const { token } = response.response.identityProviderLinks[0];

						if (!token) {
							return;
						}

						// Pass platform-specific metadata to the upload method
						const platformMetadata = metadata[social.id];
						return social.upload(token, file, platformMetadata);
					});
			});

			// Process all uploads and prepare response
			const results = await Promise.allSettled(promises).then((results) => {
				return results.map((result, index) => {
					if (result.status === "fulfilled") {
						return {
							id: activeLinks[index].id,
							status: "success",
							url: result.value,
						};
					} else {
						return {
							id: activeLinks[index].id,
							status: "error",
							message: result.reason,
						};
					}
				});
			});

			// Clean up the file after processing
			try {
				await unlink(file);
				console.log(`File ${file} has been deleted after processing`);

				// Clear the file path from the session
				req.session.set("file", null);
			} catch (err) {
				console.error(`Error deleting file ${file}:`, err);
				// Continue with the response even if file deletion fails
			}

			rep.send(results);
		},
	);
};

export default file;
