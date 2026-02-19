export type NostrProfileEventResponse = {
	pubkey: string;
	created_at: number;

	name?: string;
	display_name?: string;
	about?: string;
	picture?: string;
	banner?: string;
	nip05?: string;
	lud06?: string; // LNURL (bech32)
	lud16?: string; // lightning address (name@domain)
	website?: string;
};

export const NostrProfileEventResponse = {
	isProfileEventResponse(data: unknown): data is NostrProfileEventResponse {
		if (typeof data !== "object" || data === null) return false;
		if (!("pubkey" in data) || typeof data.pubkey !== "string") return false;
		if (!("created_at" in data) || typeof data.created_at !== "number") return false;

		if ("name" in data && typeof data.name !== "string") return false;
		if ("display_name" in data && typeof data.display_name !== "string") return false;
		if ("about" in data && typeof data.about !== "string") return false;
		if ("picture" in data && typeof data.picture !== "string") return false;
		if ("banner" in data && typeof data.banner !== "string") return false;
		if ("nip05" in data && typeof data.nip05 !== "string") return false;
		if ("lud06" in data && typeof data.lud06 !== "string") return false;
		if ("lud16" in data && typeof data.lud16 !== "string") return false;
		if ("website" in data && typeof data.website !== "string") return false;

		return true;
	},
};
