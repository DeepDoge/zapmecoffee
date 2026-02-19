import { ref, tags } from "@purifyjs/core";

export function HelloView() {
	const { div } = tags;
	const self = div();

	const npub = ref("");
	self.$bind(() => npub.follow((npub) => location.hash = npub, true));

	const { input } = tags;
	return self.append$(
		input()
			.type("text")
			.autocomplete("off")
			.placeholder("Enter npub...")
			.value(npub)
			.oninput((e) => npub.set(e.currentTarget.value)),
	);
}
