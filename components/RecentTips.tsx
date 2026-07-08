"use client";

import { useEffect, useState } from "react";
import { shortAddr, txLink } from "@/lib/config";
import { fetchRecentTips, type Tip } from "@/lib/stellar";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Props = {
  // bump this to make the list refetch (e.g. right after a tip goes through)
  refreshKey: number;
};

export default function RecentTips({ refreshKey }: Props) {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    fetchRecentTips()
      .then((t) => {
        if (!cancelled) setTips(t);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className="mt-6 rounded-2xl border border-line bg-panel p-6">
      <h2 className="text-lg font-semibold">Recent supporters</h2>

      {failed && (
        <p className="mt-3 text-sm text-muted">
          Couldn&apos;t load the feed right now — try again in a bit.
        </p>
      )}

      {!failed && tips === null && (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-line/40"
            />
          ))}
        </div>
      )}

      {!failed && tips !== null && tips.length === 0 && (
        <p className="mt-3 text-sm text-muted">
          No tips yet — be the first ⭐
        </p>
      )}

      {!failed && tips !== null && tips.length > 0 && (
        <ul className="mt-4 space-y-3">
          {tips.map((tip) => (
            <li
              key={tip.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-line/60 bg-background/60 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-mono text-xs text-muted">
                    {shortAddr(tip.from)}
                  </span>
                  <span>
                    tipped{" "}
                    <span className="font-semibold text-accent">
                      {Number(tip.amount).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      XLM
                    </span>
                  </span>
                </div>
                {tip.memo && (
                  <p className="mt-1 truncate text-sm italic text-muted">
                    &ldquo;{tip.memo}&rdquo;
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right text-xs text-muted">
                <div>{timeAgo(tip.at)}</div>
                <a
                  href={txLink(tip.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  tx ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
