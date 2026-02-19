import { Impl } from "../../traits.ts";

export type NostrEventResponse = [
	"EVENT",
	string,
	{
		id: string;
		pubkey: string;
		created_at: number;
		kind: number;
		tags: string[][];
		content: string;
		sig: string;
	},
];

export const NostrEventResponse = {
	isEventResponse(data: unknown): data is NostrEventResponse {
		if (!Array.isArray(data)) return false;
		if (data.length !== 3) return false;
		if (data[0] !== "EVENT") return false;
		if (typeof data[1] !== "string") return false;
		const event = data[2];
		if (typeof event !== "object" || event === null) return false;
		if (!("id" in event) || typeof event.id !== "string") return false;
		if (!("pubkey" in event) || typeof event.pubkey !== "string") return false;
		if (!("created_at" in event) || typeof event.created_at !== "number") return false;
		if (!("kind" in event) || typeof event.kind !== "number") return false;
		if (!("tags" in event) || !Array.isArray(event.tags)) return false;
		for (const tag of event.tags) {
			if (!Array.isArray(tag)) return false;
			if (tag.length < 2) return false;
			if (typeof tag[0] !== "string") return false;
			if (typeof tag[1] !== "string") return false;
		}
		if (!("content" in event) || typeof event.content !== "string") return false;
		if (!("sig" in event) || typeof event.sig !== "string") return false;

		return true;
	},
} satisfies Impl<NostrEventResponse>;
