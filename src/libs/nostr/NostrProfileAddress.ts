import { Impl } from "~/traits.ts";
import { hasPrefix } from "~/libs/helpers/hasPrefix.ts";
import { NostrProfileAddressToHexImpl } from "~/libs/nostr/NostrProfileAddressToHexImpl.ts";

export type NostrProfileAddress = {
	npub: `npub1${string}`;
};

export const NostrProfileAddress = {
	...NostrProfileAddressToHexImpl,
	create(npub: string): NostrProfileAddress {
		if (!hasPrefix(npub, "npub1")) {
			throw new Error("Invalid npub address");
		}
		return { npub };
	},
} satisfies Impl<NostrProfileAddress>;
