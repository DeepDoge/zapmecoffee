import { Impl } from "~/traits.ts";
import { NostrRelay } from "./NostrRelay.ts";

export type NostrRelayConnection = {
	ws: WebSocket;
};

export const NostrRelayConnection = {
	create(relay: NostrRelay): NostrRelayConnection {
		const ws = new WebSocket(relay.url);
		return { ws };
	},
} satisfies Impl<NostrRelayConnection>;
