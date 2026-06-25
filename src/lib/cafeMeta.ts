import type { Cafe } from "@/lib/types";

export function scoreLabel(score: number | null | undefined) {
  if (!score) return "—";
  return `${Math.max(1, Math.min(5, score))}/5`;
}

export function quietLabel(level: Cafe["quiet_level"], locale: string) {
  const en = { calm: "Calm", mixed: "Mixed", busy: "Busy" } as const;
  const th = { calm: "เงียบ", mixed: "กลาง ๆ", busy: "คึกคัก" } as const;
  if (!level) return "—";
  return locale === "th" ? th[level] : en[level];
}

export function laptopLabel(vibe: Cafe["laptop_vibe"], locale: string) {
  const en = { yes: "Laptop yes", okay: "Short session", no: "Not laptopy" } as const;
  const th = { yes: "ทำงานได้", okay: "นั่งสั้น ๆ", no: "ไม่เหมาะทำงาน" } as const;
  if (!vibe) return "—";
  return locale === "th" ? th[vibe] : en[vibe];
}

export function priceLabel(price: Cafe["price_band"]) {
  return price ?? "—";
}

export function localBestDrink(cafe: Cafe, locale: string) {
  return locale === "th" && cafe.best_drink_th ? cafe.best_drink_th : cafe.best_drink;
}

export function localWhyGo(cafe: Cafe, locale: string) {
  return locale === "th" && cafe.why_go_th ? cafe.why_go_th : cafe.why_go;
}

export function localBestTime(cafe: Cafe, locale: string) {
  return locale === "th" && cafe.best_time_th ? cafe.best_time_th : cafe.best_time;
}

export function localBeansNote(cafe: Cafe, locale: string) {
  return locale === "th" && cafe.beans_note_th ? cafe.beans_note_th : cafe.beans_note;
}

export function localParking(cafe: Cafe, locale: string) {
  return locale === "th" && cafe.parking_th ? cafe.parking_th : cafe.parking;
}
