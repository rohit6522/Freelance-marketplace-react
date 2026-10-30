export const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const daysLabel = (n) => `${n} ${n === 1 ? "Day" : "Days"}`;

export const revisionsLabel = (r) => (r === -1 ? "Unlimited" : `${r} ${r === 1 ? "Round" : "Rounds"}`);

export const monthYear = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

export const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}` : "");

// "Marcus Vance" -> "Marcus V." (reviewer privacy)
export const publicName = (u) => (u ? `${u.firstName} ${u.lastName?.[0] || ""}.` : "");

export const LEVELS = {
  top_rated: { label: "Top Rated", badge: "bg-on-surface text-surface-container-lowest" },
  pro: { label: "Pro Verified", badge: "bg-primary text-on-primary" },
  level2: { label: "Level 2", badge: "bg-surface-container-lowest text-on-surface border border-on-surface" },
  rising: { label: "Rising Talent", badge: "bg-surface-container-lowest text-on-surface border border-on-surface" },
};

export const TIERS = ["basic", "standard", "premium"];
export const TIER_LABELS = { basic: "Basic", standard: "Standard", premium: "Premium" };