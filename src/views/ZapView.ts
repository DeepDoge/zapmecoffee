import { ref } from "@purifyjs/core";
import { NostrProfileAddress } from "../libs/nostr/NostrProfileAddress.ts";
import { NostrRelay } from "../libs/nostr/NostrRelay.ts";
import { NostrProfileRelayList } from "../libs/nostr/NostrProfileRelayList.ts";
import { NostrProfile } from "../libs/nostr/NostrProfile.ts";

const DEFAULT_REPLAYS = [
	NostrRelay.create("wss://relay.damus.io"),
	NostrRelay.create("wss://relay.primal.net"),
	NostrRelay.create("wss://nostr.land"),
	NostrRelay.create("wss://relay.snort.social"),
	NostrRelay.create("wss://nostr-01.yakihonne.com"),
	NostrRelay.create("wss://nos.lol"),
];

type State =
	| { type: "loading" }
	| { type: "error"; message: string }
	| { type: "profile"; profile: NostrProfile };

export async function ZapView(profileAddress: NostrProfileAddress) {
	const state = ref<State>({ type: "loading" });
	await new Promise<void>((resolve) => {
		const usedRelays = new Set<string>();
		Promise.allSettled(DEFAULT_REPLAYS.map(async (relay) => {
			try {
				const result = await NostrProfileRelayList.from(relay, profileAddress);
				for (const relay of result.relays) {
					if (usedRelays.has(relay.relay.url)) continue;
					usedRelays.add(relay.relay.url);
					console.log(`Using relay ${relay.relay.url} for profile ${profileAddress.npub}`);
					const profile = await NostrProfile.from(relay.relay, profileAddress);
					state.set({ type: "profile", profile });
					resolve();
				}
			} catch (e) {
				console.error(`Failed to fetch relay list from ${relay.url}:`, e);
			}
		})).finally(() => {
			const currentState = state.get();
			if (currentState.type !== "loading") return;
			state.set({ type: "error", message: "Cannot find the profile." });
			resolve();
		});
	});
}
