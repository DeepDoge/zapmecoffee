import { ref, tags, toChild } from "@purifyjs/core";
import { css } from "./utils/css.ts";
import { NostrProfileAddress } from "./libs/nostr/NostrProfileAddress.ts";
import { ZapView } from "./views/ZapView.ts";
import { HelloView } from "./views/HelloView.ts";
import { useReplaceChildren } from "./utils/bind.ts";
import { globalStyle } from "./style.ts";

document.adoptedStyleSheets.push(globalStyle.sheet());

function App() {
	const { body } = tags;
	const self = body().$bind(appStyle.useScope());

	const urlHash = ref<string>("");
	self.$bind(() => {
		const interval = setInterval(() => urlHash.set(location.hash.slice(1)), 100);
		return () => clearInterval(interval);
	});
	const profileAddress = urlHash.derive((maybeNpub) => {
		try {
			return NostrProfileAddress.create(maybeNpub);
		} catch {
			return null;
		}
	});

	const view = profileAddress.derive((address) => {
		if (address) {
			return ZapView(address);
		} else {
			return HelloView();
		}
	});

	const { header, main } = tags;
	self.append$(
		header().textContent("ZapMe.coffee - Donate with Nostr and Lightning"),
		main().$bind(useReplaceChildren(view)),
	);

	return self;
}

const appStyle = css`
`;

document.body.replaceWith(toChild(App()));
