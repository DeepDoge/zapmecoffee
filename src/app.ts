import { ref, tags, toChild } from "@purifyjs/core";
import { NostrProfileAddress } from "./libs/nostr/NostrProfileAddress.ts";
import { globalStyle } from "./style.ts";
import { awaited } from "./utils/awaited.ts";
import { useReplaceChildren } from "./utils/bind.ts";
import { css } from "./utils/css.ts";
import { unroll } from "./utils/unroll.ts";
import { HelloView } from "./views/HelloView.ts";
import { ZapView } from "./views/ZapView.ts";

document.adoptedStyleSheets.push(globalStyle.sheet());

function App() {
	const { body, progress } = tags;
	const self = body().$bind(appStyle.useScope());

	const urlHash = ref<string>(location.hash.slice(1));
	self.$bind(() => {
		const interval = setInterval(() => urlHash.set(location.hash.slice(1)), 100);
		return () => clearInterval(interval);
	});
	const profileAddress = urlHash
		.derive((maybeNpub) => {
			if (maybeNpub.startsWith("nostr:")) {
				return maybeNpub.slice("nostr:".length);
			}
			return maybeNpub.toLowerCase();
		})
		.derive((maybeNpub) => {
			try {
				return NostrProfileAddress.create(maybeNpub);
			} catch {
				return null;
			}
		});

	const view = profileAddress.derive((address) => {
		if (address) {
			return awaited(ZapView(address), progress());
		} else {
			return HelloView();
		}
	}).pipe(unroll);

	self.$bind(useReplaceChildren(view));

	return self;
}

const appStyle = css`
	:scope {
		min-block-size: 100dvb;
		display: block grid;
		grid-template-columns: 1fr;
		place-items: center;
		place-content: center;
		padding-block: 2em;
		background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);

		@container style(--mobile: true) {
			padding-block: 0;
			grid-template-rows: 1fr;
			place-items: stretch;
		}
	}
`;

document.body.replaceWith(toChild(App()));
