export const DEFAULT_DEPOSIT_WALLET_BEP20 =
  "0x24E7dDA3585DCaDaebAF57436b71FFff7E1d1fE6";
export const DEFAULT_DEPOSIT_WALLET_TRC20 =
  "TMVCshbSF6YoTetHAuB2ru3w3HEnbgFTXj";

export type DepositNetwork = "bep20" | "trc20";

export function isValidSenderAddress(
  network: DepositNetwork,
  address: string
): boolean {
  const trimmed = address.trim();
  if (network === "bep20") {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  }
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed);
}
