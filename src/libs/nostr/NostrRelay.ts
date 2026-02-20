import { Impl } from "~/traits.ts";

export type NostrRelay = {
	url: string;
};

export const NostrRelay = {
	create(url: string): NostrRelay {
		return { url };
	},
} satisfies Impl<NostrRelay>;
