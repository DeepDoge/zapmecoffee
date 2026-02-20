import { NostrRelay } from "~/libs/nostr/NostrRelay.ts";

export type NostrProfileRelay = {
	relay: NostrRelay;
	read: boolean;
	write: boolean;
};
