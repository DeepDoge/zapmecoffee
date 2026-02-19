import { Impl } from "../../traits.ts";

export type NostrEOSEResponse = ["EOSE", string];

export const NostrEOSEResponse = {
	isEOSEResponse(data: unknown): data is NostrEOSEResponse {
		if (!Array.isArray(data)) return false;
		if (data.length !== 2) return false;
		if (data[0] !== "EOSE") return false;
		if (typeof data[1] !== "string") return false;

		return true;
	},
} satisfies Impl<NostrEOSEResponse>;
