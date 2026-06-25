"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Download, Loader2, Check, Coffee, Trophy, Sparkles, ShieldCheck, Map as MapIcon, Crown } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Loading, MiniMetric, ProgressBar } from "@/components/ui";
import { JibJibLogo } from "@/components/JibJibLogo";
import { tierForCount } from "@/lib/tiers";
import { achievementStats, unlockedAchievements } from "@/lib/achievements";
import { tileGradient, initials, localName } from "@/lib/utils";
import type { Cafe } from "@/lib/types";

type BagRow = { cafe_id: string; bagged_at: string };
type RankRow = { user_id: string; rank: number };

export default function CardPage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [bags, setBags] = useState<BagRow[]>([]);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const [cafesRes, bagsRes, profileRes] = await Promise.all([
      supabase.from("cafes").select("*"),
      supabase.from("bags").select("cafe_id, bagged_at").order("bagged_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);
    setCafes((cafesRes.data as Cafe[]) ?? []);
    setBags((bagsRes.data as BagRow[]) ?? []);
    const fallback = user.email?.split("@")[0] ?? "bagger";
    setUsername((profileRes.data?.username as string) || fallback);
    setDisplayName((profileRes.data?.display_name as string) || fallback);
    try {
      const { data: lb } = await supabase.rpc("get_leaderboard", { city: null, limit_n: 500 });
      const mine = (lb as RankRow[] | null)?.find((r) => r.user_id === user.id);
      setRank(mine?.rank ?? null);
    } catch {
      setRank(null);
    }
    setBusy(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const baggedIds = useMemo(() => new Set(bags.map((b) => b.cafe_id)), [bags]);
  const cafeById = useMemo(() => new Map(cafes.map((c) => [c.id, c])), [cafes]);
  const count = baggedIds.size;
  const specialty = cafes.filter((c) => c.is_specialty);
  const specialtyDone = specialty.filter((c) => baggedIds.has(c.id)).length;
  const roastersDone = cafes.filter((c) => baggedIds.has(c.id) && (c.is_specialty || c.tags?.includes("roaster") || c.trail_tags?.includes("roaster"))).length;
  const slowBarDone = cafes.filter((c) => baggedIds.has(c.id) && (c.tags?.includes("pourover") || c.tags?.includes("filter") || c.trail_tags?.includes("slowbar"))).length;
  const tier = tierForCount(count);
  const progress = cafes.length ? count / cafes.length : 0;
  const stampCafes = bags.map((b) => cafeById.get(b.cafe_id)).filter(Boolean).slice(0, 8) as Cafe[];
  const lastBag = stampCafes[0];
  const badges = unlockedAchievements(achievementStats(cafes, baggedIds)).slice(0, 4);
  const licenseNumber = `UBN-${String(count).padStart(3, "0")}-${username.slice(0, 3).toUpperCase()}`;

  async function download() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2.4, cacheBust: true, backgroundColor: "#211711" });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `jibjib-${username}.png`;
      a.click();
    } catch {
      // user can screenshot instead
    } finally {
      setDownloading(false);
    }
  }

  if (loading || !user || busy) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("card.poster")}</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em]">{t("card.title")}</h1>
        </div>
        <Link href="/map" className="btn btn-ghost btn-sm"><MapIcon size={15} />{t("nav.map")}</Link>
      </div>

      <div ref={cardRef} className="holo-card scene-glow chrome-edge rounded-[34px] p-5 text-cream">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <JibJibLogo variant="mark" className="h-11 w-11 shrink-0" />
            <div>
              <JibJibLogo variant="word" dark className="h-[36px] w-[118px] -ml-1" />
              <p className="-mt-1 font-thai text-[10px] font-semibold text-honey">{t("card.license")}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1"><span className="stamp-chip text-cream/80">{licenseNumber}</span><span className="font-thai text-[10px] font-black text-honey">{t("culture.deeDer")}</span></div>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-1.5"><span className="street-label gold">{t("culture.tastePassport")}</span><span className="street-label">{t("culture.gpsOnly")}</span></div>

        <div className="relative z-10 mt-4 rounded-[28px] border border-cream/15 bg-cream/[0.075] p-4 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("card.member")}</p>
              <h2 className="thai-pop-title mt-1 truncate text-[28px] font-black leading-none tracking-[-0.06em]">{displayName}</h2>
              <p className="mt-2 font-mono text-[12px] text-cream/48">@{username}</p>
            </div>
            <div className="rounded-[22px] border border-honey/25 bg-honey/12 px-3 py-2 text-right">
              <p className="font-mono text-[9px] uppercase tracking-eyebrow text-cream/45">{t("card.rank")}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-2xl font-black text-honey"><Trophy size={19} />{rank ? `#${rank}` : "—"}</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("card.bagged")}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="stat-num text-[92px] font-black tracking-[-0.095em]">{count}</span>
                <span className="stat-num text-2xl text-cream/35">/ {cafes.length}</span>
              </div>
            </div>
            <div className="pb-3 text-right">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("card.tier")}</p>
              <p className="mt-1 max-w-[8rem] text-right text-lg font-black leading-tight text-honey">{locale === "th" ? tier.current.nameTh : tier.current.name}</p>
            </div>
          </div>
          <div className="mt-4"><ProgressBar value={progress} tone="honey" /></div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
          <CardStat label={t("card.specialty")} value={`${specialtyDone}/${specialty.length}`} />
          <CardStat label={t("card.roasters")} value={roastersDone} />
          <CardStat label={t("card.slowbar")} value={slowBarDone} />
        </div>

        <div className="relative z-10 mt-5 rounded-[26px] border border-cream/15 bg-cream/[0.075] p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("card.lastBag")}</p>
              <p className="mt-1 truncate text-lg font-black">{lastBag ? localName(lastBag, locale) : "—"}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-[18px] bg-honey text-espresso"><Crown size={20} /></span>
          </div>
          <div className="mt-4 grid grid-cols-8 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => {
              const c = stampCafes[i];
              return (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl" style={c ? { background: c.photo_url ? undefined : tileGradient(c.name) } : { borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(251,247,239,0.22)" }}>
                  {c?.photo_url ? <img src={c.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                  {c ? <><span className="absolute left-1 top-0.5 font-mono text-[8px] font-black text-cream/95 drop-shadow-sm">{initials(c.name)}</span><Check size={13} className="absolute inset-0 m-auto text-cream" strokeWidth={3} /></> : <Coffee size={15} className="absolute inset-0 m-auto text-cream/15" strokeWidth={1.6} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-1.5">
          {badges.length ? badges.map((b) => <span key={b.key} className="rounded-pill bg-honey px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wide text-espresso">{locale === "th" ? b.shortTh : b.short}</span>) : <span className="rounded-pill border border-cream/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-cream/45">{t("card.noBadges")}</span>}
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-cream/15 pt-4">
          <p className="font-thai text-[12px] font-semibold text-cream/52">{t("card.city")}</p>
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-honey"><ShieldCheck size={14} />{t("card.gps")}</p>
        </div>
      </div>

      <p className="text-center text-sm leading-relaxed text-ink-soft">{t("card.caption")}</p>

      <div className="grid grid-cols-3 gap-2.5">
        <MiniMetric label={t("card.specialty")} value={`${specialtyDone}/${specialty.length}`} tone="honey" />
        <MiniMetric label={t("card.roasters")} value={roastersDone} tone="jade" />
        <MiniMetric label={t("card.slowbar")} value={slowBarDone} tone="clay" />
      </div>

      <button onClick={download} disabled={downloading} className="btn btn-ink btn-lg w-full">
        {downloading ? <><Loader2 size={18} className="animate-spin" />{t("card.downloading")}</> : <><Download size={18} />{t("card.download")}</>}
      </button>
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-cream/15 bg-cream/10 px-3 py-2 backdrop-blur-md">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-cream/45">{label}</p>
      <p className="stat-num mt-1 text-xl font-black text-cream">{value}</p>
    </div>
  );
}
