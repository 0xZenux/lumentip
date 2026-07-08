"use client";

import { useCallback, useEffect, useState } from "react";
import RecentTips from "@/components/RecentTips";
import TipForm from "@/components/TipForm";
import WalletCard from "@/components/WalletCard";
import { CREATOR, CREATOR_ADDRESS, accountLink } from "@/lib/config";
import { connect, restoreSession } from "@/lib/freighter";
import { fundWithFriendbot, getXlmBalance } from "@/lib/stellar";

type Wallet = { address: string; network: string };

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const refreshBalance = useCallback(async (address: string) => {
    setBalanceLoading(true);
    try {
      setBalance(await getXlmBalance(address));
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // pick the session back up if the site was already authorized
  useEffect(() => {
    restoreSession().then((s) => s && setWallet(s));
  }, []);

  useEffect(() => {
    if (wallet) refreshBalance(wallet.address);
  }, [wallet, refreshBalance]);

  async function handleConnect() {
    setConnecting(true);
    setConnectError(null);
    try {
      setWallet(await connect());
    } catch (err) {
      setConnectError(
        err instanceof Error ? err.message : "Could not connect."
      );
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    // Freighter has no programmatic disconnect; dropping local state is the way
    setWallet(null);
    setBalance(null);
    setConnectError(null);
  }

  async function handleFund() {
    if (!wallet) return;
    setFunding(true);
    try {
      await fundWithFriendbot(wallet.address);
    } catch {
      // friendbot mostly refuses when the account is already funded —
      // refreshing below sorts out either case
    } finally {
      await refreshBalance(wallet.address);
      setFunding(false);
    }
  }

  function handleTipSent() {
    // balance changed and there's a fresh tip to show
    if (wallet) refreshBalance(wallet.address);
    setFeedKey((k) => k + 1);
  }

  const networkOk =
    !wallet || wallet.network === "" || wallet.network === "TESTNET";

  return (
    <div className="relative z-10 mx-auto w-full max-w-xl px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <div className="text-lg font-semibold tracking-tight">
          ⭐ Lumen<span className="text-accent">Tip</span>
        </div>
        {!wallet && (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect Freighter"}
          </button>
        )}
      </header>

      {connectError === "FREIGHTER_MISSING" ? (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Freighter isn&apos;t installed.{" "}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Grab the extension
          </a>{" "}
          and refresh this page.
        </div>
      ) : connectError ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {connectError}
        </div>
      ) : null}

      {wallet && (
        <div className="mb-6">
          <WalletCard
            address={wallet.address}
            network={wallet.network}
            balance={balance}
            balanceLoading={balanceLoading}
            funding={funding}
            onFund={handleFund}
            onDisconnect={handleDisconnect}
          />
        </div>
      )}

      <section className="rounded-2xl border border-line bg-panel p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-line bg-background text-4xl">
          {CREATOR.avatar}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{CREATOR.name}</h1>
        <p className="text-sm text-muted">{CREATOR.handle}</p>
        <p className="mt-2 text-sm">{CREATOR.tagline}</p>
        <a
          href={accountLink(CREATOR_ADDRESS)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-muted transition-colors hover:text-foreground"
        >
          view the jar on stellar.expert ↗
        </a>
      </section>

      <TipForm
        address={wallet?.address ?? null}
        networkOk={networkOk}
        onTipSent={handleTipSent}
      />

      <RecentTips refreshKey={feedKey} />

      <footer className="mt-10 text-center text-xs text-muted">
        <p>
          runs on the Stellar <span className="text-foreground">testnet</span>{" "}
          · network fee ≈ 0.00001 XLM
        </p>
        <p className="mt-1">
          <a
            href="https://github.com/0xZenux/lumentip"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            source on GitHub ↗
          </a>
        </p>
      </footer>
    </div>
  );
}
