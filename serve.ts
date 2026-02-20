/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import appHtml from "~/app.html" with { type: "text" };
import appJs from "./dist/app.js" with { type: "text" };
import { serveDir } from "@std/http/file-server";

const port = Number(Deno.env.get("PORT") ?? 3000);

const html = appHtml.replace("<!-- inject -->", `<script type="module">${appJs}</script>`);

Deno.serve({ port }, (req) => {
	const url = new URL(req.url);

	if (url.pathname === "/") {
		return new Response(html, { headers: { "content-type": "text/html" } });
	}

	return serveDir(req, {
		fsRoot: "./src/assets/",
		urlRoot: "assets",
		showDirListing: false,
	});
});
