export type Tier = { key: string; name: string; nameTh: string; min: number };

export const TIERS: Tier[] = [
  { key: "new", name: "New in town", nameTh: "หน้าใหม่", min: 0 },
  { key: "sipper", name: "Sipper", nameTh: "นักจิบ", min: 1 },
  { key: "regular", name: "Regular", nameTh: "ขาประจำ", min: 5 },
  { key: "hopper", name: "Cafe Hopper", nameTh: "นักตระเวนคาเฟ่", min: 10 },
  { key: "connoisseur", name: "Connoisseur", nameTh: "นักชิมตัวจริง", min: 20 },
  { key: "roaster", name: "Ubon Roaster", nameTh: "เจ้าถิ่นอุบล", min: 35 },
];

export function tierForCount(count: number): {
  current: Tier;
  next: Tier | null;
  toNext: number;
  progress: number;
} {
  let current = TIERS[0];
  for (const t of TIERS) if (count >= t.min) current = t;
  const idx = TIERS.findIndex((t) => t.key === current.key);
  const next = idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
  const toNext = next ? next.min - count : 0;
  const span = next ? next.min - current.min : 1;
  const done = next ? count - current.min : 1;
  const progress = next ? Math.min(1, done / span) : 1;
  return { current, next, toNext, progress };
}
