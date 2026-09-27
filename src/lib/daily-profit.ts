export const PROFIT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function canClaimPlan(
  lastClaimedAt: Date | null | undefined,
  now = new Date()
) {
  if (!lastClaimedAt) return true;
  return now.getTime() - lastClaimedAt.getTime() >= PROFIT_COOLDOWN_MS;
}

export function nextClaimAfter(
  lastClaimedAt: Date | null | undefined
): Date | null {
  if (!lastClaimedAt) return null;
  return new Date(lastClaimedAt.getTime() + PROFIT_COOLDOWN_MS);
}

type PlanRow = {
  active: boolean;
  dailyProfitUsd: number;
  lastClaimedAt: Date | null;
};

export function getProfitClaimStatus(plans: PlanRow[], now = new Date()) {
  let claimableTotal = 0;
  let nextClaimAt: Date | null = null;
  let hasActivePlan = false;

  for (const p of plans) {
    if (!p.active) continue;
    hasActivePlan = true;
    if (canClaimPlan(p.lastClaimedAt, now)) {
      claimableTotal += p.dailyProfitUsd;
    } else {
      const next = nextClaimAfter(p.lastClaimedAt);
      if (next && (!nextClaimAt || next < nextClaimAt)) {
        nextClaimAt = next;
      }
    }
  }

  return {
    hasActivePlan,
    claimableTotal,
    canClaim: claimableTotal > 0,
    nextClaimAt,
  };
}

export function formatCountdown(ms: number, locale: "ar" | "en") {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const text = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return locale === "ar" ? text : text;
}
