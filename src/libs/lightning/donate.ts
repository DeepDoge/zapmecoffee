import { bech32 } from "@scure/base";
import { hasPrefix } from "~/libs/helpers/hasPrefix.ts";
import { NostrProfile } from "~/libs/nostr/NostrProfile.ts";

export async function createDonationInvoice(params: {
	profile: NostrProfile;
	amountSats: number;
	message?: string;
}): Promise<string | null> {
	const { profile, amountSats, message } = params;

	if (!profile.lud16 && !profile.lud06) {
		throw new Error("Profile does not support lightning payments");
	}

	// --------------------------
	// 1. Resolve LNURL endpoint
	// --------------------------
	let lnurl: string;

	if (profile.lud16) {
		const [name, domain] = profile.lud16.split("@");
		lnurl = `https://${domain}/.well-known/lnurlp/${name}`;
	} else if (profile.lud06 && hasPrefix(profile.lud06, "lnurl1")) {
		const decoded = bech32.decode(profile.lud06, 1500);
		const bytes = bech32.fromWords(decoded.words);
		lnurl = new TextDecoder().decode(new Uint8Array(bytes));
	} else {
		return null;
	}

	// --------------------------
	// 2. Fetch LNURL pay info
	// --------------------------
	const payInfo = await fetch(lnurl).then((r) => r.json());
	if (!PayInfo.isPayInfo(payInfo)) {
		throw new Error("Invalid LNURL pay info");
	}

	const amountMsats = amountSats * 1000;

	if (
		amountMsats < payInfo.minSendable ||
		amountMsats > payInfo.maxSendable
	) {
		throw new Error("Amount outside allowed range");
	}

	// --------------------------
	// 3. Request invoice with optional comment
	// --------------------------
	const paramsUrl = new URL(payInfo.callback);
	paramsUrl.searchParams.set("amount", amountMsats.toString());

	if (message) {
		// optional comment for recipient
		paramsUrl.searchParams.set("comment", message);
	}

	const invoiceResponse = await fetch(paramsUrl.toString()).then((r) => r.json());
	if (!InvoiceResponse.isInvoiceResponse(invoiceResponse)) {
		throw new Error("Invalid LNURL invoice response");
	}

	return invoiceResponse.pr;
}
type PayInfo = {
	callback: string;
	minSendable: number;
	maxSendable: number;
	allowsNostr: boolean;
};

const PayInfo = {
	isPayInfo(data: unknown): data is PayInfo {
		if (typeof data !== "object" || data === null) return false;
		if (!("callback" in data) || typeof data.callback !== "string") return false;
		if (!("minSendable" in data) || typeof data.minSendable !== "number") return false;
		if (!("maxSendable" in data) || typeof data.maxSendable !== "number") return false;
		if (!("allowsNostr" in data) || typeof data.allowsNostr !== "boolean") return false;

		return true;
	},
};

type InvoiceResponse = {
	pr: string;
};

const InvoiceResponse = {
	isInvoiceResponse(data: unknown): data is InvoiceResponse {
		if (typeof data !== "object" || data === null) return false;
		if (!("pr" in data) || typeof data.pr !== "string") return false;

		return true;
	},
};
