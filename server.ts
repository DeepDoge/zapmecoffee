/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import appHtml from "./src/app.html" with { type: "text" };
import appJs from "./dist/app.js" with { type: "text" };

const port = Number(Deno.env.get("PORT") ?? 3000);

const html = appHtml.replace("<!-- inject -->", `<script type="module">${appJs}</script>`);

Deno.serve({ port }, (req) => {
	const url = new URL(req.url);

	if (url.pathname === "/") {
		return new Response(html, { headers: { "content-type": "text/html" } });
	}

	return new Response("Not Found", { status: 404 });
});
