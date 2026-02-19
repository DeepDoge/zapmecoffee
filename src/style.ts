import { css } from "./utils/css.ts";

export const globalStyle = css`
	*, ::before, ::after {
		box-sizing: border-box;
	}

	:root {
		--primary: #0070f3;
		--base: #000;
		--pop: #fff;

		--radius: 1em;
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
`;
