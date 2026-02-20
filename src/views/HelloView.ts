import { ref, tags } from "@purifyjs/core";
import { css } from "~/utils/css.ts";
import { boxMixin } from "~/style.ts";

export function HelloView() {
	const { div, h1, p, input, section, article, main, strong, span } = tags;

	const npub = ref(location.hash.slice(1));

	const self = main()
		.$bind(containerStyle.useScope())
		.$bind(() => npub.follow((v) => location.hash = v, true));

	const heroSection = section()
		.$bind(heroStyle.useScope())
		.append$(
			div().$bind(logoStyle.useScope()).textContent("⚡"),
			h1().textContent("Get zapped on Nostr"),
			p().textContent("Create your Lightning donation page in seconds. Share your link, receive sats instantly."),
		);

	const ctaSection = section()
		.$bind(ctaStyle.useScope())
		.append$(
			p().$bind(labelStyle.useScope()).textContent("Enter your npub to see your page"),
			input()
				.type("text")
				.role("textbox")
				.autocomplete("off")
				.placeholder("npub1...")
				.value(npub)
				.oninput((e) => npub.set(e.currentTarget.value)),
		);

	const featuresSection = section()
		.$bind(featuresStyle.useScope())
		.append$(
			article().append$(
				div().$bind(featureIconStyle.useScope()).textContent("⚡"),
				strong().textContent("Instant Payments"),
				p().textContent("Receive Bitcoin via Lightning. No setup, no fees, just sats in your wallet."),
			),
			article().append$(
				div().$bind(featureIconStyle.useScope()).textContent("🔗"),
				strong().textContent("Share Anywhere"),
				p().textContent("One simple link works everywhere. Post it on Nostr, Twitter, or your website."),
			),
			article().append$(
				div().$bind(featureIconStyle.useScope()).textContent("🎁"),
				strong().textContent("Support Messages"),
				p().textContent("Fans can attach personal messages to every zap they send you."),
			),
		);

	const howItWorksSection = section()
		.$bind(howItWorksStyle.useScope())
		.append$(
			strong().textContent("How it works"),
			div().$bind(stepsStyle.useScope()).append$(
				div().append$(
					span().textContent("1"),
					p().textContent("Add a Lightning address to your Nostr profile (lud06 or lud16)"),
				),
				div().append$(
					span().textContent("2"),
					p().textContent("Enter your npub above to see your donation page"),
				),
				div().append$(
					span().textContent("3"),
					p().textContent("Share your link and start receiving sats"),
				),
			),
		);

	return self.append$(
		heroSection,
		ctaSection,
		featuresSection,
		howItWorksSection,
	);
}

const containerStyle = css`
	:scope {
		${boxMixin};

		display: block grid;
		gap: 2.5em;
		padding: 2.5em;
		align-content: start;

		text-align: center;
		text-wrap: balance;

		@container style(--mobile: false) {
			inline-size: 60em;
			max-inline-size: 100%;
		}
	}
`;

const heroStyle = css`
	:scope {
		display: block grid;
		justify-items: center;
		gap: 1em;

		h1 {
			font-size: 2em;
			font-weight: 800;
			color: #fff;
			margin: 0;
			background: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		p {
			color: #a8a8b3;
			font-size: 1.1em;
			max-inline-size: 30ch;
			margin: 0;
			line-height: 1.5;
		}
	}
`;

const logoStyle = css`
	:scope {
		font-size: 3em;
		display: block grid;
		place-items: center;
		inline-size: 2em;
		aspect-ratio: 1;
		background: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
		border-radius: 50%;
		box-shadow: 0 0.5em 2em rgba(244, 162, 97, 0.3);
	}
`;

const ctaStyle = css`
	:scope {
		display: block grid;
		gap: 0.75em;
		background: rgba(255, 255, 255, 0.03);
		padding: 1.5em;
		border-radius: 1em;
		border: 1px solid rgba(255, 255, 255, 0.1);

		input {
			font-size: 1.1em;
			text-align: center;
		}
	}
`;

const labelStyle = css`
	:scope {
		color: #a8a8b3;
		font-size: 0.9em;
		margin: 0;
	}
`;

const featuresStyle = css`
	:scope {
		display: block grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15em), 1fr));
		gap: 1.5em;

		@container (inline-size < 40em) {
			grid-template-columns: 1fr;
		}

		article {
			display: block grid;
			justify-items: center;
			gap: 0.5em;
			padding: 1em;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 0.75em;

			strong {
				color: #fff;
				font-size: 0.95em;
			}

			p {
				color: #a8a8b3;
				font-size: 0.85em;
				margin: 0;
				line-height: 1.4;
			}
		}
	}
`;

const featureIconStyle = css`
	:scope {
		font-size: 1.5em;
		display: block grid;
		place-items: center;
		inline-size: 2em;
		aspect-ratio: 1;
		background: rgba(244, 162, 97, 0.1);
		border-radius: 50%;
	}
`;

const howItWorksStyle = css`
	:scope {
		display: block grid;
		gap: 1em;
		justify-items: center;

		strong {
			color: #fff;
			font-size: 1.1em;
		}
	}
`;

const stepsStyle = css`
	:scope {
		display: block grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15em), 1fr));
		gap: 1.5em;
		width: 100%;

		@container (inline-size < 40em) {
			grid-template-columns: 1fr;
		}

		> div {
			display: block grid;
			justify-items: center;
			gap: 0.5em;

			span {
				display: block grid;
				place-items: center;
				inline-size: 2em;
				aspect-ratio: 1;
				background: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
				border-radius: 50%;
				color: #fff;
				font-weight: 700;
				font-size: 0.9em;
			}

			p {
				color: #a8a8b3;
				font-size: 0.85em;
				margin: 0;
				line-height: 1.4;
			}
		}
	}
`;
