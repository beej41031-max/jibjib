"use client";
import Link from "next/link";
import { Check, Coffee, Star, ChevronRight, Zap, MapPin, BadgeCheck, Sparkles } from "lucide-react";
import type { Cafe } from "@/lib/types";
import type { Achievement } from "@/lib/achievements";
import { cn, tileGradient, initials, localName, localArea } from "@/lib/utils";
import { localBestDrink } from "@/lib/cafeMeta";
import { useT } from "@/i18n/provider";

export function ProgressBar({ value, tone = "jade" }: { value: number; tone?: "jade" | "honey" | "clay" | "ink" }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-pill bg-line/80">
      <div
        className={cn(
          "h-full rounded-pill transition-all duration-700",
          tone === "jade" && "bg-jade",
          tone === "honey" && "bg-honey",
          tone === "clay" && "bg-clay",
          tone === "ink" && "bg-ink"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-line/70", className)} />;
}

export function Loading() {
  return (
    <div className="flex justify-center gap-1.5 py-16">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2.5 w-2.5 animate-bounce rounded-full bg-jade" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

export function MiniMetric({ label, value, tone = "ink" }: { label: string; value: React.ReactNode; tone?: "ink" | "jade" | "honey" | "clay" }) {
  return (
    <div className="surface-luxe rounded-[22px] px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-soft">{label}</p>
      <p className={cn("stat-num mt-1 text-xl font-semibold", tone === "jade" && "text-jade", tone === "honey" && "text-honey-deep", tone === "clay" && "text-clay", tone === "ink" && "text-ink")}>{value}</p>
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { locale } = useT();
  const done = Math.min(achievement.done, achievement.target);
  const complete = done >= achievement.target;
  return (
    <div
      className={cn(
        "surface-luxe min-w-[176px] rounded-[26px] p-3.5",
        complete && "border-honey/70 bg-honey-wash"
      )}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-full", complete ? "bg-honey text-espresso shadow-stamp" : "bg-paper text-ink-soft")}> 
          {complete ? <Check size={16} strokeWidth={3} /> : <Zap size={15} />}
        </span>
        <span className="stat-num rounded-pill bg-paper/70 px-2 py-1 text-[12px] text-ink-soft">
          {done}/{achievement.target}
        </span>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-tight">{locale === "th" ? achievement.labelTh : achievement.label}</p>
      <div className="mt-3"><ProgressBar value={achievement.target ? achievement.done / achievement.target : 0} tone={achievement.tone} /></div>
    </div>
  );
}

function CafeThumb({ cafe, size = 58, bagged }: { cafe: Cafe; size?: number; bagged: boolean }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-[19px] border border-white/40 shadow-card" style={{ width: size, height: size, background: cafe.photo_url ? undefined : tileGradient(cafe.name) }}>
      {cafe.photo_url ? <img src={cafe.photo_url} alt="" className="h-full w-full object-cover" /> : null}
      <span className="absolute left-2 top-1.5 font-mono text-[13px] font-black text-cream/95 drop-shadow-sm">{initials(cafe.name)}</span>
      <Coffee size={size * 0.36} className="absolute bottom-1.5 right-1.5 text-cream/35" strokeWidth={1.6} />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/12" />
      {bagged && (
        <span className="absolute inset-0 grid place-items-center bg-jade/52 backdrop-blur-[1px]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/18 text-cream ring-1 ring-cream/35">
            <Check size={size * 0.36} strokeWidth={3} />
          </span>
        </span>
      )}
    </div>
  );
}

export function CafeTile({ cafe, bagged }: { cafe: Cafe; bagged: boolean }) {
  const { t, locale } = useT();
  const best = localBestDrink(cafe, locale);
  const area = localArea(cafe, locale);
  return (
    <Link href={`/cafe/${cafe.id}`} className="surface-luxe group flex items-center gap-3.5 rounded-[26px] p-3 transition-all active:scale-[0.99]">
      <CafeThumb cafe={cafe} bagged={bagged} />
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-semibold leading-tight">{localName(cafe, locale)}</p>
          {cafe.local_verified && <BadgeCheck size={14} className="shrink-0 text-jade" />}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-soft">
          {area && <span className="flex min-w-0 items-center gap-0.5 truncate"><MapPin size={11} />{area}</span>}
          {cafe.rating ? (
            <span className="flex shrink-0 items-center gap-0.5">
              <Star size={11} className="fill-honey text-honey" />
              {cafe.rating.toFixed(1)}
            </span>
          ) : null}
          {cafe.price_band ? <span className="shrink-0">{cafe.price_band}</span> : null}
        </div>
        {best && <p className="mt-1.5 truncate text-[12px] font-medium text-ink-soft/80">{best}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cafe.is_specialty && <span className="rounded-pill bg-honey-wash px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-honey-deep">{t("common.specialty")}</span>}
          {cafe.trail_tags?.slice(0, 1).map((tag) => <span key={tag} className="rounded-pill bg-jade-wash px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-jade">{tag}</span>)}
        </div>
      </div>
      {bagged ? (
        <span className="shrink-0 rounded-pill bg-jade px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-cream">{t("common.bagged")}</span>
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-ink-soft transition-transform group-hover:translate-x-0.5">
          <ChevronRight size={17} />
        </span>
      )}
    </Link>
  );
}

export function StampGrid({ cafes, baggedIds }: { cafes: Cafe[]; baggedIds: Set<string> }) {
  const { locale } = useT();
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {cafes.map((cafe) => {
        const bagged = baggedIds.has(cafe.id);
        return (
          <Link key={cafe.id} href={`/cafe/${cafe.id}`} className="group flex flex-col items-center gap-1.5">
            <div
              className={cn("relative aspect-square w-full overflow-hidden rounded-[22px] transition-transform group-active:scale-95", !bagged && "border border-dashed border-line bg-cream/70")}
              style={bagged ? { background: cafe.photo_url ? undefined : tileGradient(cafe.name) } : undefined}
            >
              {bagged && cafe.photo_url ? <img src={cafe.photo_url} alt="" className="h-full w-full object-cover" /> : null}
              {bagged ? (
                <>
                  <span className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-black/16" />
                  <span className="absolute left-1.5 top-1 font-mono text-[11px] font-black text-cream/95 drop-shadow-sm">{initials(cafe.name)}</span>
                  <span className="absolute inset-0 grid place-items-center bg-black/8">
                    <Check size={23} className="text-cream drop-shadow-sm" strokeWidth={3} />
                  </span>
                  <span className="animate-stamp-in absolute inset-0" />
                </>
              ) : (
                <Coffee size={20} className="absolute inset-0 m-auto text-line" strokeWidth={1.6} />
              )}
            </div>
            <span className={cn("w-full truncate text-center text-[9px] leading-tight", bagged ? "font-semibold text-ink" : "text-ink-soft/60")}>{localName(cafe, locale)}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function ViralTeaser({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="surface-luxe rounded-[26px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-1 text-lg font-semibold leading-tight">{value}</p>
          <p className="mt-1 text-[12px] text-ink-soft">{sub}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-honey-wash text-honey-deep">
          <Sparkles size={20} />
        </span>
      </div>
    </div>
  );
}

export function CultureStrip() {
  const { t } = useT();
  const chips = [
    { key: "culture.noChains", cls: "hot" },
    { key: "culture.gpsOnly", cls: "cool" },
    { key: "culture.ubonScene", cls: "" },
    { key: "culture.slowbar", cls: "cool" },
    { key: "culture.cardReady", cls: "hot" },
  ];
  return (
    <div className="culture-strip" aria-label="JibJib culture tags">
      {chips.map((c) => <span key={c.key} className={`culture-chip ${c.cls}`}>{t(c.key)}</span>)}
    </div>
  );
}

export function ScenePulse({ bagged, rank }: { bagged?: number; rank?: number | null }) {
  const { t } = useT();
  return (
    <div className="trend-card passport-perf rounded-[28px] p-4 pl-8">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="street-label gold">{t("culture.sceneLive")}</p>
          <p className="mt-3 text-[17px] font-black leading-tight tracking-[-0.035em]">{t("culture.sceneTitle")}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{t("culture.sceneSub")}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-soft">{t("culture.cityCode")}</p>
          <p className="stat-num mt-1 text-2xl font-black text-jade">UBN</p>
          <p className="mt-1 font-mono text-[10px] text-ink-soft">{rank ? `#${rank}` : `${bagged ?? 0} bags`}</p>
        </div>
      </div>
    </div>
  );
}

export function StickerStack() {
  const { t } = useT();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[22%] z-20 flex items-center justify-between px-2">
      <span className="sticker-pop shadow-lift">{t("culture.deeDer")}</span>
      <span className="sticker-pop alt shadow-lift">{t("culture.notGoogle")}</span>
    </div>
  );
}
