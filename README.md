# ⭐ LumenTip

My little tip jar on the Stellar testnet, built for Level 1 (White Belt) of the Rise In × Stellar *Journey to Mastery* challenge.

You connect your Freighter wallet, pick an amount — coffee, pizza or rocket fuel — maybe type a short note, and hit send. A few seconds later the tip is on-chain and your note shows up in the "Recent supporters" feed, because it travels inside the transaction memo itself.

**Live demo:** <https://0xzenux.github.io/lumentip/>

## What's inside

- Connect / disconnect Freighter, and the session survives a page refresh
- Your XLM balance, live — with a one-click Friendbot top-up when the wallet is empty
- Preset amounts, a custom amount field, and an optional on-chain note. Stellar caps text memos at 28 *bytes* (not characters), so the counter enforces that while you type
- Honest transaction feedback: waiting for your signature → submitting → success with a stellar.expert link. Cancelling the signature or running out of XLM gets you a friendly message instead of a stack trace
- A "Recent supporters" feed read straight from Horizon, memos included
- Confetti when the tip goes through. Non-negotiable.

## Running it locally

Node 20+ and the [Freighter](https://www.freighter.app/) extension with its network set to **Testnet** are all you need.

```bash
git clone https://github.com/0xZenux/lumentip.git
cd lumentip
npm install
npm run dev
```

Open <http://localhost:3000> and connect. If the wallet is empty, hit **Get test XLM** — Friendbot tops you up with 10,000 testnet lumens.

Tips land in the jar account: [`GCZO…LCY3`](https://stellar.expert/explorer/testnet/account/GCZOMCBJCCEKETJYDGXYG44ESN6OZ2J72BZ5SCHFIAGEQX65RVWFLCY3). If you fork this and want the tips for yourself, swap out `CREATOR_ADDRESS` (and the profile bits) in [`lib/config.ts`](lib/config.ts).

## Notes on how it works

- Next.js 16 + TypeScript + Tailwind 4, fully client-side and statically exported — that's how it fits on GitHub Pages
- [`lib/freighter.ts`](lib/freighter.ts) wraps `@stellar/freighter-api` for connecting and signing; [`lib/stellar.ts`](lib/stellar.ts) builds and submits the payment with `@stellar/stellar-sdk`, while plain reads (balance, feed) just hit Horizon's REST API
- The feed uses `join=transactions` on the payments endpoint, so memos come back in a single request instead of one extra call per record
- Payments are built with open-ended timebounds. My machine's clock turned out to be ~40 minutes off and every transaction died with `tx_too_late` before I figured out why — and if it happened to me, it would happen to visitors too
