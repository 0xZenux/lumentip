"use client";

import { useState } from "react";
import { accountLink, shortAddr } from "@/lib/config";

type Props = {
  address: string;
  network: string;
  balance: string | null;
  balanceLoading: boolean;
  funding: boolean;
  onFund: () => void;
  onDisconnect: () => void;
};

export default function WalletCard({
  address,
  network,
  balance,
  balanceLoading,
  funding,
  onFund,
  onDisconnect,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can fail in some browsers, not a big deal
    }
  }

  const wrongNetwork = network !== "" && network !== "TESTNET";
  const lowBalance = balance !== null && parseFloat(balance) < 5;

  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm">{shortAddr(address)}</span>
          <button
            onClick={copy}
            className="text-xs text-muted transition-colors hover:text-foreground"
            title="Copy address"
          >
            {copied ? "copied!" : "copy"}
          </button>
          <a
            href={accountLink(address)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            explorer ↗
          </a>
        </div>
        <button
          onClick={onDisconnect}
          className="text-xs text-muted transition-colors hover:text-red-400"
        >
          disconnect
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-muted">Balance</div>
          <div className="text-2xl font-semibold">
            {balanceLoading
              ? "…"
              : balance === null
                ? "0"
                : Number(balance).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
            <span className="ml-1 text-sm font-normal text-muted">XLM</span>
          </div>
        </div>
        {(balance === null || lowBalance) && !balanceLoading && (
          <button
            onClick={onFund}
            disabled={funding}
            className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            {funding ? "funding…" : "Get test XLM"}
          </button>
        )}
      </div>

      {balance === null && !balanceLoading && (
        <p className="mt-2 text-xs text-muted">
          This wallet isn&apos;t funded on testnet yet — hit the button above
          and Friendbot will send you 10,000 XLM.
        </p>
      )}
      {wrongNetwork && (
        <p className="mt-2 text-xs text-amber-400">
          Freighter is set to {network}. Switch it to Testnet to send tips.
        </p>
      )}
    </div>
  );
}
