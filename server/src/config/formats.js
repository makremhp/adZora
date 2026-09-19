// Kept in sync with src/config.js on the frontend. This is the source of truth the
// server uses to validate campaigns and compute publisher revenue share — it must never
// be duplicated with different numbers on the client.

export const AD_FORMATS = {
  native: { name: "Native", pricing: ["CPM", "CPC"], share: { publisher: 0.45, platform: 0.55 } },
  social: { name: "Social", pricing: ["CPM", "CPC"], share: { publisher: 0.40, platform: 0.60 } },
  video: { name: "Video", pricing: ["CPM", "CPV"], share: { publisher: 0.50, platform: 0.50 } },
};

export const PRICING_MODELS = ["CPM", "CPC", "CPV"];

export const WITHDRAWAL_MINIMUM = 50;
export const DEPOSIT_MINIMUM = 1;

export const PAYMENT_METHODS = {
  deposit: ["web3", "binance", "cwallet"],
  withdrawal: ["cwallet", "ton", "binance"],
};
