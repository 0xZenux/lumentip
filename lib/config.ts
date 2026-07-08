// Where the tips go. Swap this for your own testnet account if you fork this.
export const CREATOR_ADDRESS =
  "GCZOMCBJCCEKETJYDGXYG44ESN6OZ2J72BZ5SCHFIAGEQX65RVWFLCY3";

export const CREATOR = {
  name: "Soheyl",
  handle: "@0xZenux",
  tagline: "Building on Stellar, one belt at a time 🥋",
  avatar: "⭐",
};

export const PRESETS = [
  { emoji: "☕", label: "Coffee", amount: "5" },
  { emoji: "🍕", label: "Pizza", amount: "10" },
  { emoji: "🚀", label: "Rocket fuel", amount: "25" },
];

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

export const txLink = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;

export const accountLink = (address: string) =>
  `https://stellar.expert/explorer/testnet/account/${address}`;

export const shortAddr = (addr: string) =>
  `${addr.slice(0, 4)}…${addr.slice(-4)}`;
