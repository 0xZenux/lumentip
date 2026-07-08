# ⭐ LumenTip

A tiny tip jar that lives on the [Stellar](https://stellar.org) testnet. Connect your Freighter wallet, pick an amount (coffee, pizza, or rocket fuel), leave a note — and the tip lands on-chain in a few seconds, with the note stored right in the transaction memo.

**Live demo:** <https://0xzenux.github.io/lumentip/>

Built for Level 1 (White Belt) of the Rise In × Stellar *Journey to Mastery* challenge.

## What it does

- 🔌 Connect / disconnect the Freighter browser extension — the session survives page refreshes
- 💰 Live XLM balance, with a one-click Friendbot top-up when the wallet is empty or running low
- ☕ Preset tip amounts, a custom amount field, and an optional note that goes on-chain as a text memo (the 28-byte limit is enforced as you type)
- 📡 Full transaction feedback: signing → submitting → success with a stellar.expert link, or a friendly error (cancelled signature, not enough XLM, wrong network…)
- 🙌 A "Recent supporters" feed read straight from Horizon, memos included
- 🎉 Confetti. Obviously.

## Challenge checklist

| Requirement | Where to find it |
| --- | --- |
| Wallet connection (connect + disconnect) | header button → wallet card |
| Balance display | wallet card, refreshes after every tip |
| Send an XLM transaction | tip form → Freighter signs → Horizon submits |
| Transaction feedback | live status panel + tx hash linked to stellar.expert |

## Run it locally

You'll need Node 20+ and the [Freighter](https://www.freighter.app/) extension with its network set to **Testnet**.

```bash
git clone https://github.com/0xZenux/lumentip.git
cd lumentip
npm install
npm run dev
```

Open <http://localhost:3000> and connect. If your wallet is empty, hit **Get test XLM** — Friendbot sends you 10,000 testnet lumens.

Tips go to the jar account:
[`GCZO…LCY3`](https://stellar.expert/explorer/testnet/account/GCZOMCBJCCEKETJYDGXYG44ESN6OZ2J72BZ5SCHFIAGEQX65RVWFLCY3)

Want the tips to land in *your* account instead? Change `CREATOR_ADDRESS` (and the profile bits) in [`lib/config.ts`](lib/config.ts).

## How it's put together

- **Next.js 16 + TypeScript + Tailwind 4**, fully client-side and statically exported
- **@stellar/freighter-api** for connecting and signing, wrapped in [`lib/freighter.ts`](lib/freighter.ts)
- **@stellar/stellar-sdk** builds and submits the payment; reads (balance, feed) hit Horizon's REST API directly
- The supporters feed uses `join=transactions` on the payments endpoint, so memos come back in a single request
- Payments use open-ended timebounds — a visitor whose system clock is a few minutes off would otherwise get their tx rejected with `tx_too_late` (found that one the hard way)

## Screenshots

| Wallet connected | Balance & funding | Tip sent |
| --- | --- | --- |
| ![wallet connected](docs/screenshots/wallet-connected.png) | ![balance](docs/screenshots/balance.png) | ![tip success](docs/screenshots/tip-success.png) |
