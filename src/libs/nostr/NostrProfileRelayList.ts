import { Impl } from "../../traits.ts";
import { NostrEOSEResponse } from "./NostrEOSEResponse.ts";
import { NostrEventResponse } from "./NostrEventResponse.ts";
import { NostrProfileAddress } from "./NostrProfileAddress.ts";
import { NostrProfileRelay } from "./NostrProfileRelay.ts";
import { NostrRelay } from "./NostrRelay.ts";
import { NostrRelayConnection } from "./NostrRelayConnection.ts";

export type NostrProfileRelayList = {
	relays: NostrProfileRelay[];
	createdAt: number;
};

export const NostrProfileRelayList = {
	from(relay: NostrRelay, profileAddress: NostrProfileAddress): Promise<NostrProfileRelayList> {
		const pubkey = NostrProfileAddress.toHex(profileAddress);

		const { ws } = NostrRelayConnection.create(relay);

		return new Promise((resolve, reject) => {
			ws.onopen = () => {
				const subId = "relaylist-sub";

				const req = ["REQ", subId, { kinds: [10002], authors: [pubkey], limit: 1 }];

				ws.send(JSON.stringify(req));
			};

			ws.onmessage = (msg) => {
				const data = JSON.parse(msg.data);
				if (NostrEventResponse.isEventResponse(data)) {
					const event = data[2];

					if (event.kind === 10002) {
						const relays: NostrProfileRelay[] = event.tags
							.filter((t) => t[0] === "r")
							.map((t) => ({
								relay: NostrRelay.create(t[1]),
								read: t[2] !== "write",
								write: t[2] !== "read",
							}));

						ws.close();
						resolve({ relays, createdAt: event.created_at });
					}
				}

				if (NostrEOSEResponse.isEOSEResponse(data)) {
					ws.close();
					reject(new Error("No relay list found for this profile"));
				}
			};

			ws.onerror = reject;
		});
	},
} satisfies Impl<NostrProfileRelayList>;
