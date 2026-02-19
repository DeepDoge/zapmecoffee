import { NostrRelay } from "./NostrRelay.ts";

export type NostrProfileRelay = {
	relay: NostrRelay;
	read: boolean;
	write: boolean;
};
