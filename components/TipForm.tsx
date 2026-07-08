"use client";

import { useState } from "react";
import { PRESETS, txLink } from "@/lib/config";
import { MAX_MEMO_BYTES, memoBytes, sendTip } from "@/lib/stellar";

type Status =
  | { phase: "idle" }
  | { phase: "working"; note: string }
  | { phase: "success"; hash: string }
  | { phase: "error"; message: string };

type Props = {
  address: string | null;
  networkOk: boolean;
  onTipSent: () => void;
};

export default function TipForm({ address, networkOk, onTipSent }: Props) {
  const [amount, setAmount] = useState(PRESETS[0].amount);
  const [customMode, setCustomMode] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  const busy = status.phase === "working";
  const bytes = memoBytes(message);
  const memoOk = bytes <= MAX_MEMO_BYTES;
  const amountOk = /^\d+(\.\d{1,7})?$/.test(amount) && parseFloat(amount) > 0;
  const canSend = !!address && networkOk && amountOk && memoOk && !busy;

  const selectedPreset = customMode
    ? null
    : PRESETS.find((p) => p.amount === amount) ?? null;

  function pickPreset(presetAmount: string) {
    setCustomMode(false);
    setAmount(presetAmount);
  }

  async function handleSend() {
    if (!address) return;
    setStatus({ phase: "working", note: "check Freighter to sign…" });
    try {
      const hash = await sendTip(address, amount, message, (step) => {
        if (step === "submit") {
          setStatus({ phase: "working", note: "submitting to the network…" });
        }
      });
      setStatus({ phase: "success", hash });
      setMessage("");
      onTipSent();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setStatus({
        phase: "error",
        message:
          msg === "REJECTED"
            ? "You cancelled the signature — no harm done."
            : msg,
      });
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-panel p-6">
      <h2 className="text-lg font-semibold">Send a tip</h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const active = selectedPreset?.amount === p.amount;
          return (
            <button
              key={p.amount}
              onClick={() => pickPreset(p.amount)}
              disabled={busy}
              className={`rounded-xl border px-3 py-3 text-center transition-colors disabled:opacity-60 ${
                active
                  ? "border-accent bg-accent/10"
                  : "border-line hover:border-accent/50"
              }`}
            >
              <div className="text-2xl">{p.emoji}</div>
              <div className="mt-1 text-xs text-muted">{p.label}</div>
              <div className="text-sm font-medium">{p.amount} XLM</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="or a custom amount (XLM)"
          value={customMode ? amount : ""}
          onChange={(e) => {
            setCustomMode(true);
            setAmount(e.target.value);
          }}
          disabled={busy}
          className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60 disabled:opacity-60"
        />
        {customMode && amount !== "" && !amountOk && (
          <p className="mt-1 text-xs text-red-400">
            Enter a positive number (up to 7 decimal places).
          </p>
        )}
      </div>

      <div className="mt-3">
        <div className="relative">
          <input
            type="text"
            placeholder="add a note (optional — it goes on-chain!)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-line bg-background px-4 py-2.5 pr-16 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60 disabled:opacity-60"
          />
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
              memoOk ? "text-muted" : "text-red-400"
            }`}
          >
            {bytes}/{MAX_MEMO_BYTES}
          </span>
        </div>
        {!memoOk && (
          <p className="mt-1 text-xs text-red-400">
            Stellar text memos max out at {MAX_MEMO_BYTES} bytes — shorten the
            note a bit.
          </p>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy
          ? "Sending…"
          : `Send ${amountOk ? amount : "…"} XLM${
              selectedPreset ? " " + selectedPreset.emoji : ""
            }`}
      </button>

      {!address && (
        <p className="mt-2 text-center text-xs text-muted">
          connect your wallet first
        </p>
      )}

      {status.phase === "working" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-background px-4 py-3 text-sm text-muted">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {status.note}
        </div>
      )}
      {status.phase === "success" && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Tip sent — thank you! 💛{" "}
          <a
            href={txLink(status.hash)}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            see it on stellar.expert ↗
          </a>
        </div>
      )}
      {status.phase === "error" && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {status.message}
        </div>
      )}
    </section>
  );
}
