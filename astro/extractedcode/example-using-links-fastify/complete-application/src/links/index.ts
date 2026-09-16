import { TwitterLinkDefinition } from "./twitter";
import { YoutubeLinkDefinition } from "./youtube";

export type LinkDefinition<TMetadata = undefined> = {
	id: "twitter" | "youtube";
	providerId: string;
	name: string;
	icon: string;
	url: string;
	color: string;
	// Add optional metadata parameter with default empty object
	upload: (
		token: string,
		file: string,
		metadata?: TMetadata,
	) => Promise<string>;
};

export const LINKS = [TwitterLinkDefinition, YoutubeLinkDefinition];
