import {
  Asset,
  BASE_FEE,
  Horizon,
  Memo,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  CREATOR_ADDRESS,
  FRIENDBOT_URL,
  HORIZON_URL,
  NETWORK_PASSPHRASE,
} from "./config";
import { signTx } from "./freighter";

const server = new Horizon.Server(HORIZON_URL);

// Text memos on Stellar are capped at 28 bytes, not 28 characters.
export const MAX_MEMO_BYTES = 28;

export function memoBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export async function getXlmBalance(address: string): Promise<string | null> {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  // 404 means the account hasn't received its first deposit yet
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Horizon returned ${res.status}`);
  const data = await res.json();
  const native = (
    data.balances as Array<{ asset_type: string; balance: string }>
  ).find((b) => b.asset_type === "native");
  return native ? native.balance : "0";
}

export async function fundWithFriendbot(address: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}/?addr=${encodeURIComponent(address)}`);
  if (!res.ok) {
    throw new Error("Friendbot refused — maybe the account is already funded?");
  }
}

export async function sendTip(
  from: string,
  amount: string,
  message: string,
  onProgress?: (step: "sign" | "submit") => void
): Promise<string> {
  const account = await server.loadAccount(from);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: CREATOR_ADDRESS,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(120);

  const msg = message.trim();
  if (msg) builder.addMemo(Memo.text(msg));

  const tx = builder.build();
  onProgress?.("sign");
  const signedXdr = await signTx(tx.toXDR(), from);
  onProgress?.("submit");
  const signed = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  try {
    const result = await server.submitTransaction(signed);
    return result.hash;
  } catch (err) {
    throw new Error(friendlySubmitError(err));
  }
}

function friendlySubmitError(err: unknown): string {
  const codes = (
    err as {
      response?: {
        data?: {
          extras?: {
            result_codes?: { transaction?: string; operations?: string[] };
          };
        };
      };
    }
  )?.response?.data?.extras?.result_codes;

  const op = codes?.operations?.[0];
  if (op === "op_underfunded") return "Not enough XLM to cover this tip.";
  if (op === "op_no_destination")
    return "The tip jar account doesn't exist on this network.";
  if (codes?.transaction === "tx_insufficient_fee")
    return "Network is busy, try again in a moment.";
  if (codes?.transaction) return `Transaction failed (${codes.transaction}).`;
  return "Something went wrong while submitting the transaction.";
}

export type Tip = {
  id: string;
  from: string;
  amount: string;
  memo: string | null;
  hash: string;
  at: string;
};

export async function fetchRecentTips(limit = 10): Promise<Tip[]> {
  // join=transactions embeds each payment's transaction so we get memos
  // without doing one extra request per record
  const url = `${HORIZON_URL}/accounts/${CREATOR_ADDRESS}/payments?order=desc&limit=${
    limit + 5
  }&join=transactions`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Horizon returned ${res.status}`);
  const data = await res.json();
  const records = data?._embedded?.records ?? [];

  const tips: Tip[] = [];
  for (const r of records) {
    // friendbot funding shows up as create_account — that's not a tip
    if (r.type !== "payment") continue;
    if (r.asset_type !== "native" || r.to !== CREATOR_ADDRESS) continue;
    tips.push({
      id: r.id,
      from: r.from,
      amount: r.amount,
      memo:
        r.transaction && r.transaction.memo_type === "text"
          ? r.transaction.memo
          : null,
      hash: r.transaction_hash,
      at: r.created_at,
    });
    if (tips.length >= limit) break;
  }
  return tips;
}
