import { Impl } from "../../traits.ts";
import { hasPrefix } from "../helpers/hasPrefix.ts";
import { NostrProfileAddressToHexImpl } from "./NostrProfileAddressToHexImpl.ts";

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
