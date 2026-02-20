import { bech32 } from "@scure/base";
import { Impl } from "~/traits.ts";
import { ToHex } from "~/libs/traits/ToHex.ts";
import { NostrProfileAddress } from "~/libs/nostr/NostrProfileAddress.ts";

export const NostrProfileAddressToHexImpl = {
	toHex(self) {
		const { words } = bech32.decode(self.npub);
		const bytes = bech32.fromWords(words);
		return bytes.toHex();
	},
} satisfies Impl<NostrProfileAddress, ToHex<NostrProfileAddress>>;
