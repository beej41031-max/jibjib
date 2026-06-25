import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tileGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const a = h;
  const b = (h + 38) % 360;
  return `linear-gradient(135deg, hsl(${a} 42% 34%), hsl(${b} 38% 22%))`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function localName(
  cafe: { name: string; name_th: string | null },
  locale: string
): string {
  return locale === "th" && cafe.name_th ? cafe.name_th : cafe.name;
}

export function localArea(
  cafe: { area: string | null; area_th: string | null },
  locale: string
): string {
  return (locale === "th" && cafe.area_th ? cafe.area_th : cafe.area) ?? "";
}

export function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
