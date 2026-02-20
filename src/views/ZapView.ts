import { qrcode } from "@libs/qrcode";
import { computed, ref, tags } from "@purifyjs/core";
import { createDonationInvoice } from "~/libs/lightning/donate.ts";
import { NostrProfile } from "~/libs/nostr/NostrProfile.ts";
import { NostrProfileAddress } from "~/libs/nostr/NostrProfileAddress.ts";
import { NostrProfileRelayList } from "~/libs/nostr/NostrProfileRelayList.ts";
import { NostrRelay } from "~/libs/nostr/NostrRelay.ts";
import { boxMixin } from "~/style.ts";
import { css, style } from "~/utils/css.ts";

const DEFAULT_REPLAYS = [
	NostrRelay.create("wss://relay.damus.io"),
	NostrRelay.create("wss://relay.primal.net"),
	NostrRelay.create("wss://nostr.land"),
	NostrRelay.create("wss://relay.snort.social"),
	NostrRelay.create("wss://nostr-01.yakihonne.com"),
	NostrRelay.create("wss://nos.lol"),
];

export async function ZapView(profileAddress: NostrProfileAddress) {
	type ViewState =
		| { type: "loading" }
		| { type: "error"; message: string }
		| { type: "profile"; profile: NostrProfile };

	const state = ref<ViewState>({ type: "loading" });

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
				console.warn(`Failed to fetch relay list from ${relay.url}:`, e);
			}
		})).finally(() => {
			const currentState = state.get();
			if (currentState.type !== "loading") return;
			state.set({ type: "error", message: "Cannot find the profile." });
			resolve();
		});
	});

	const { fieldset, h1, img, form, label, main, input, button, section, div, picture, strong, a } = tags;

	const self = main().$bind(style`
		${boxMixin};

		display: block grid;
		gap: 2em;
		padding: 2em;
		align-content: start;

		@container style(--mobile: false) {
			inline-size: 30em;
			max-inline-size: 100%;
		}
	`);

	const amount = ref(0);
	const message = ref("");

	type InvoiceState =
		| { type: "idle" }
		| { type: "loading" }
		| { type: "error"; message: string }
		| { type: "success"; invoice: string };
	const invoice = ref<InvoiceState>({ type: "idle" });

	const busy = computed(() => state.get().type === "loading" || invoice.get().type === "loading");
	const profile = state.derive((s) => s.type === "profile" ? s.profile : null);

	const profileSection = section()
		.$bind(style`
			display: block grid;
			justify-items: center;
			gap: 0.5em;
		`)
		.id("profile")
		.ariaLabel("Nostr profile information")
		.append$(
			picture().$bind(avatarStyle.useScope()).append$(
				img()
					.src(profile.derive((p) => p?.picture || ""))
					.alt("Profile"),
			),
			h1().$bind(nameStyle.useScope())
				.textContent(profile.derive((p) => p?.displayName || p?.name || "")),
			div().$bind(nip05Style.useScope())
				.ariaHidden(profile.derive((p) => p?.nip05 ? "false" : "true"))
				.textContent(profile.derive((p) => p?.nip05 ? `✓ ${p.nip05}` : "")),
			button()
				.$bind(shareButtonStyle.useScope())
				.type("button")
				.role("button")
				.onclick((event) => {
					const target = event.currentTarget;
					const shareUrl = `${location.origin}/#${profileAddress.npub}`;
					navigator.clipboard.writeText(shareUrl);
					target.textContent = "Link Copied!";
					target.disabled = true;
					setTimeout(() => {
						target.textContent = "Copy Share Link";
						target.disabled = false;
					}, 1000);
				})
				.textContent("Copy Share Link"),
		);

	async function onSubmit(e: Event) {
		e.preventDefault();
		const currentState = state.get();
		if (currentState.type !== "profile") return;
		const currentProfile = currentState.profile;

		invoice.set({ type: "loading" });

		try {
			const inv = await createDonationInvoice({
				profile: currentProfile,
				amountSats: amount.get(),
				message: message.get() || undefined,
			});
			if (inv) {
				invoice.set({ type: "success", invoice: inv });
			} else {
				invoice.set({ type: "error", message: "Failed to create invoice" });
			}
		} catch (e) {
			invoice.set({ type: "error", message: e instanceof Error ? e.message : "Unknown error" });
		}
	}

	const amountOptions = [100, 1000, 10000] as const;
	const formatAmount = (amount: number) =>
		Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(amount) + " sats";

	const amountFieldset = fieldset()
		.$bind(style`
				button[aria-selected="true"],
				&:not(:has(button[aria-selected="true"])) input {
					border-color: #f4a261;
				}
			`)
		.append$(
			strong().textContent("Amount to zap"),
			div().role("group").ariaLabel("Select amount to zap").append$(
				amountOptions.map((option) =>
					button()
						.role("button")
						.type("button")
						.ariaSelected(amount.derive((v) => v === option ? "true" : "false"))
						.onclick(() => amount.set(option))
						.textContent(formatAmount(option))
				),
			),
			input()
				.type("number")
				.role("spinbutton")
				.min("0")
				.step("1")
				.placeholder(amount.derive((amount) => amount > 0 ? String(amount) : "Custom amount"))
				.oninput((e) => amount.set(e.currentTarget.valueAsNumber))
				.onblur((e) => {
					const element = e.currentTarget;
					if (!amountOptions.includes(element.valueAsNumber)) return;
					element.value = "";
				})
				.$bind((element) =>
					amount.follow((amount) => {
						if (amount === 0) {
							element.value = "";
							return;
						}

						if (element === document.activeElement) {
							element.valueAsNumber = amount;
							return;
						}

						if (!amountOptions.includes(amount)) {
							element.valueAsNumber = amount;
							return;
						}

						element.value = "";
					}, true)
				),
		);

	const messageFieldset = fieldset().append$(
		label().append$(
			strong().textContent("Message (optional)"),
			input()
				.type("text")
				.role("textbox")
				.placeholder("Thanks for the coffee! ☕")
				.value(message)
				.oninput((e) => message.set(e.currentTarget.value)),
		),
	);

	// Zap form
	const zapForm = form()
		.onsubmit(onSubmit)
		.append$(
			amountFieldset,
			messageFieldset,
			button()
				.$bind(zapButtonStyle.useScope())
				.type("submit")
				.disabled(computed(() => busy.get() || amount.get() <= 0))
				.textContent(busy.derive((b) => b ? "Brewing..." : "☕ Zap!")),
		);

	self.append$(
		profileSection,
		zapForm,
		invoice.derive((inv) => {
			if (inv.type !== "success") return null;
			return section()
				.id("invoice")
				.ariaLabel("Invoice QR Code and copy button")
				.$bind(invoiceStyle.useScope())
				.append$(
					img().alt("Invoice QR Code").src([
						"data:image/svg+xml;charset=utf-8",
						encodeURIComponent(qrcode(inv.invoice, { output: "svg", border: 2 })),
					].join(",")),
					button()
						.type("button")
						.role("button")
						.onclick((event) => {
							const target = event.currentTarget;
							navigator.clipboard.writeText(inv.invoice);
							target.textContent = "Copied!";
							target.disabled = true;
							setTimeout(() => {
								target.textContent = "Copy Invoice";
								target.disabled = false;
							}, 1000);
						})
						.textContent("Copy Invoice"),
				);
		}),
		section()
			.$bind(footerStyle.useScope())
			.append$(
				a()
					.$bind(createOwnLinkStyle.useScope())
					.href("/#")
					.textContent("Get Your Own Page"),
			),
	);

	return self;
}

// Fixed aspect-ratio avatar - no layout shift
const avatarStyle = css`
	:scope {
		inline-size: 4em;
		aspect-ratio: 1;
		border-radius: 50%;
		overflow: clip;
		background-image: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
		display: block grid;
		place-items: center;
		box-shadow: 0 0.25em 1em rgba(244, 162, 97, 0.3);
	}

	img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
`;

const nameStyle = css`
	:scope {
		font-size: 1.25em;
		font-weight: 700;
		color: #fff;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const nip05Style = css`
	:scope {
		font-size: 0.75em;
		color: #2ecc71;
		background-color: rgba(46, 204, 113, 0.1);
		padding: 0.25em 0.75em;
		border-radius: 1em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		visibility: visible;

		&[aria-hidden="true"] {
			visibility: hidden;
		}
	}
`;

const zapButtonStyle = css`
	:scope {
		padding: 1em;
		border-radius: 1em;
		border: none;
		background-image: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
		color: #fff;
		cursor: pointer;
		font-size: 1.1em;
		font-weight: 700;
		transition: linear 0.2s;
		transition-property: background-color, transform, box-shadow;

		&:hover:not(:disabled) {
			transform: translateY(-0.125em);
			box-shadow: 0 0.5em 1em rgba(244, 162, 97, 0.4);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
`;

const invoiceStyle = css`
	:scope {
		display: block grid;
		grid-template-columns: minmax(0, 15em);
		justify-items: center;
		justify-content: center;
		gap: 1em;
		padding: 1em;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 1em;

		img {
			inline-size: 100%;
			aspect-ratio: 1;
			border-radius: 0.75em;
			background-color: #fff;
			padding: 0.5em;
		}
	}
`;

const shareButtonStyle = css`
	:scope {
		font-size: 0.75em;
		padding: 0.5em 1em;
		border-radius: 1em;
		border: none;
		background-color: rgba(255, 255, 255, 0.1);
		color: #fff;
		cursor: pointer;
		transition: background-color 0.2s linear;

		&:hover:not(:disabled) {
			background-color: rgba(255, 255, 255, 0.2);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
`;

const createOwnLinkStyle = css`
	:scope {
		font-size: 0.875em;
		padding: 0.75em 1.5em;
		border-radius: 1em;
		border: 2px solid #f4a261;
		background-color: transparent;
		color: #f4a261;
		text-decoration: none;
		display: inline-block;
		transition: all 0.2s linear;
		text-align: center;

		&:hover {
			background-color: #f4a261;
			color: #fff;
		}
	}
`;

const footerStyle = css`
	:scope {
		display: block;
		text-align: center;
		padding-top: 1em;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
`;
