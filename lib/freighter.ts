// Thin wrapper around the Freighter extension API.
// Imported dynamically so nothing touches `window` during the static build.

import { NETWORK_PASSPHRASE } from "./config";

async function freighter() {
  return await import("@stellar/freighter-api");
}

function errMsg(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export async function isInstalled(): Promise<boolean> {
  try {
    const api = await freighter();
    const res = await api.isConnected();
    return !!res.isConnected;
  } catch {
    return false;
  }
}

// Grabs the address without prompting if the site was already authorized,
// so a returning visitor doesn't have to click "connect" every time.
export async function restoreSession(): Promise<{
  address: string;
  network: string;
} | null> {
  try {
    const api = await freighter();
    const res = await api.getAddress();
    if (res.error || !res.address) return null;
    const net = await api.getNetworkDetails();
    return { address: res.address, network: net.network ?? "" };
  } catch {
    return null;
  }
}

export async function connect(): Promise<{ address: string; network: string }> {
  const api = await freighter();
  const installed = await api.isConnected();
  if (!installed.isConnected) throw new Error("FREIGHTER_MISSING");

  const access = await api.requestAccess();
  if (access.error || !access.address) {
    throw new Error(errMsg(access.error) || "Connection was declined.");
  }

  const net = await api.getNetworkDetails();
  return { address: access.address, network: net.network ?? "" };
}

export async function signTx(xdr: string, address: string): Promise<string> {
  const api = await freighter();
  const res = await api.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (res.error || !res.signedTxXdr) {
    const msg = errMsg(res.error);
    if (/declin|reject|denied/i.test(msg)) throw new Error("REJECTED");
    throw new Error(msg || "Signing failed.");
  }
  return res.signedTxXdr;
}
