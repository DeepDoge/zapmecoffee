import { css, mixin } from "./utils/css.ts";

export const boxMixin = mixin`
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	border-radius: var(--radius);
	box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.3);

	@container style(--mobile: true) {
		border-radius: 0;
	}
`;

export const globalStyle = css`
	*, ::before, ::after {
		box-sizing: border-box;
	}

	:root {
		--primary: #f4a261;
		--base: #0f0f1a;
		--pop: #fff;

		--radius: 1em;
		--mobile: false;
	}

	@media (width < 700px) {
		:root {
			--mobile: true;
		}
	}

	:root {
		font-size: 1em;
		font-family: system-ui;
		line-height: 1.2;
		color-scheme: dark;
	}

	* {
		margin: 0;
	}

	html {
		container-type: inline-size;
	}

	form {
		display: block grid;
		gap: 1em;
	}

	fieldset {
		border: none;
		padding: 0;
	}

	form:has(> fieldset:only-of-type) {
		& > fieldset {
			display: block grid;
			gap: 1em;
		}
	}

	label,
	form:not(:has(> fieldset:only-of-type)) > fieldset {
		display: block grid;
		gap: 0.5em;

		& > strong {
			font-size: 0.85em;
			font-weight: normal;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);
		}
	}

	[role="textbox"],
	[role="spinbutton"] {
		min-inline-size: 0;
		padding: 0.75em 1em;
		border: solid 1px transparent;
		border-radius: 0.75em;
		background: var(--base);
		color: #fff;
		font-size: 1em;

		&:focus-visible {
			outline: none;
			border-color: var(--primary);
		}
	}

	[role="group"] {
		display: block grid;
		grid-auto-flow: column;
		gap: 0.25em;
	}

	[role="button"] {
		padding: 0.75em;
		border: solid 1px transparent;
		border-radius: 0.75em;
		background: var(--base);
		color: color-mix(in srgb, var(--base), var(--pop) 90%);
		cursor: pointer;
		font-size: 0.9em;
		transition: linear 0.2s;
		transition-property: border-color, color, background-color;

		&:hover {
			background-color: color-mix(in srgb, var(--base), var(--primary) 2.5%);
			color: var(--primary);
		}

		&:focus-visible {
			outline: none;
			border-color: var(--primary);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}

	progress {
		all: unset;
		display: block grid;
		grid-template-columns: minmax(0, 5em);
		place-content: center;

		&::-webkit-progress-bar {
			background-color: transparent;
		}
		&::-webkit-progress-value {
			background-color: transparent;
		}
		&::-moz-progress-bar {
			background-color: transparent;
		}

		&::before {
			content: "";
			aspect-ratio: 1;
			background: conic-gradient(
				from 0deg,
				var(--primary) 0%,
				transparent 60%,
				transparent 100%
			);
			border-radius: 50%;
			mask: radial-gradient(circle, transparent 55%, black 56%);
			animation: spin 1s linear infinite;
		}

		&:indeterminate {
			background-color: transparent;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;
