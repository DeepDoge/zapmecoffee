import { Impl } from "../../traits.ts";
import { NostrEOSEResponse } from "./NostrEOSEResponse.ts";
import { NostrEventResponse } from "./NostrEventResponse.ts";
import { NostrProfileAddress } from "./NostrProfileAddress.ts";
import { NostrProfileEventResponse } from "./NostrProfileEventResponse.ts";
import { NostrRelay } from "./NostrRelay.ts";
import { NostrRelayConnection } from "./NostrRelayConnection.ts";

export type NostrProfile = {
	pubkey: string;
	createdAt: number;

	name?: string;
	displayName?: string;
	about?: string;
	picture?: string;
	banner?: string;
	nip05?: string;
	lud06?: string; // LNURL (bech32)
	lud16?: string; // lightning address (name@domain)
	website?: string;
};

export const NostrProfile = {
	from(relay: NostrRelay, profileAddress: NostrProfileAddress): Promise<NostrProfile> {
		const pubkey = NostrProfileAddress.toHex(profileAddress);
		const { ws } = NostrRelayConnection.create(relay);

		return new Promise((resolve, reject) => {
			ws.onopen = () => {
				const subId = "profile-sub";

				const req = ["REQ", subId, { kinds: [0], authors: [pubkey], limit: 1 }];
				ws.send(JSON.stringify(req));
			};

			ws.onmessage = (msg) => {
				const data = JSON.parse(msg.data);

				if (NostrEventResponse.isEventResponse(data)) {
					const event = data[2];

					if (event.kind === 0) {
						try {
							const content = JSON.parse(event.content);
							if (!NostrProfileEventResponse.isProfileEventResponse(content)) {
								ws.close();
								reject(new Error("Invalid profile event response"));
								return;
							}

							const profile: NostrProfile = {
								pubkey: event.pubkey,
								createdAt: event.created_at,

								name: content.name,
								displayName: content.display_name,
								about: content.about,
								picture: content.picture,
								banner: content.banner,
								nip05: content.nip05,
								lud06: content.lud06,
								lud16: content.lud16,
								website: content.website,
							};

							ws.close();
							resolve(profile);
						} catch {
							ws.close();
							reject(new Error("Invalid profile metadata JSON"));
						}
					}
				}

				if (NostrEOSEResponse.isEOSEResponse(data)) {
					ws.close();
					reject(new Error("No profile metadata found"));
				}
			};

			ws.onerror = reject;
		});
	},
} satisfies Impl<NostrProfile>;
