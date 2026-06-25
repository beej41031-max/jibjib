"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Check, X, Trophy, Share2, Map as MapIcon, LogOut, Sparkles, Flame, Crown } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Loading, ProgressBar, StampGrid, CafeTile, Skeleton, AchievementCard, MiniMetric, ViralTeaser, CultureStrip, ScenePulse } from "@/components/ui";
import { tierForCount } from "@/lib/tiers";
import { achievementStats } from "@/lib/achievements";
import { localName } from "@/lib/utils";
import type { Cafe } from "@/lib/types";

type BagRow = { cafe_id: string; bagged_at: string };
type RankRow = { user_id: string; rank: number; bag_count: number };

export default function HomePage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { user, loading, configured } = useAuth();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [bags, setBags] = useState<BagRow[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [rank, setRank] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const [cafesRes, bagsRes, profileRes] = await Promise.all([
      supabase.from("cafes").select("*").order("is_specialty", { ascending: false }).order("name"),
      supabase.from("bags").select("cafe_id, bagged_at").order("bagged_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);

    setCafes((cafesRes.data as Cafe[]) ?? []);
    setBags((bagsRes.data as BagRow[]) ?? []);
    const fallback = user.email?.split("@")[0] ?? "Bagger";
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
  const total = cafes.length;
  const specialty = cafes.filter((c) => c.is_specialty);
  const specialtyDone = specialty.filter((c) => baggedIds.has(c.id)).length;
  const roastersDone = cafes.filter((c) => baggedIds.has(c.id) && (c.is_specialty || c.tags?.includes("roaster") || c.trail_tags?.includes("roaster"))).length;
  const tier = tierForCount(count);
  const achievements = achievementStats(cafes, baggedIds);
  const unlocked = achievements.filter((a) => a.done >= a.target).length;
  const recent = bags.slice(0, 5).map((b) => cafeById.get(b.cafe_id)).filter(Boolean) as Cafe[];
  const lastBag = recent[0];
  const progress = total ? count / total : 0;
  const nextStamp = cafes
    .filter((c) => !baggedIds.has(c.id))
    .sort((a, b) => Number(b.is_specialty) - Number(a.is_specialty) || (b.serious_score ?? 0) - (a.serious_score ?? 0) || (b.photo_score ?? 0) - (a.photo_score ?? 0))[0];

  async function saveName() {
    if (!user) return;
    const name = nameInput.trim();
    if (!name) return setEditing(false);
    setDisplayName(name);
    setEditing(false);
    const supabase = getSupabaseBrowser();
    await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading || !user) return <Loading />;

  if (!configured) {
    return (
      <div className="surface-luxe mt-6 rounded-[28px] p-6">
        <p className="font-semibold">Almost there</p>
        <p className="mt-2 text-sm text-ink-soft">{t("login.configMissing")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder={t("home.namePrompt")}
              className="field h-10 flex-1"
            />
            <button onClick={saveName} className="btn btn-primary btn-sm h-10 w-10 px-0"><Check size={16} /></button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm h-10 w-10 px-0"><X size={16} /></button>
          </div>
        ) : (
          <>
            <button onClick={() => { setNameInput(displayName); setEditing(true); }} className="group flex min-w-0 items-center gap-1.5">
              <span className="truncate text-xl font-semibold tracking-tight">{displayName || <Skeleton className="h-6 w-24" />}</span>
              <Pencil size={13} className="shrink-0 text-ink-soft/50 group-hover:text-ink-soft" />
            </button>
            <button onClick={signOut} className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              <LogOut size={13} />
              {t("common.signOut")}
            </button>
          </>
        )}
      </div>

      <div className="hero-aurora scene-glow chrome-edge rounded-[34px] p-5 text-cream">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-thai text-[13px] font-semibold text-honey">{t("home.cityLicense")}</p>
            <h1 className="thai-pop-title mt-2 text-[34px] font-black leading-[0.96] tracking-[-0.06em]">
              {t("home.flexTitle")}
            </h1>
            <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-cream/62">{t("home.flexSub")}</p>
          </div>
          <div className="rounded-[24px] border border-cream/15 bg-cream/10 p-3 text-right backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("home.rank")}</p>
            <p className="mt-1 flex items-center justify-end gap-1.5 text-honey">
              <Trophy size={17} />
              {rank ? <span className="stat-num text-2xl font-black">#{rank}</span> : <span className="text-sm text-cream/45">—</span>}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("home.bagged")}</p>
            {busy ? (
              <Skeleton className="mt-3 h-16 w-40 bg-cream/10" />
            ) : (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="stat-num text-[88px] font-black tracking-[-0.08em]">{count}</span>
                <span className="stat-num text-2xl text-cream/40">/ {total}</span>
              </div>
            )}
          </div>
          <div className="pb-3 text-right">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-cream/45">{t("home.tier")}</p>
            <p className="mt-1 max-w-[8rem] text-right text-lg font-bold leading-tight text-honey">{locale === "th" ? tier.current.nameTh : tier.current.name}</p>
          </div>
        </div>

        <div className="relative z-10 mt-4 rounded-[24px] border border-cream/15 bg-cream/10 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-cream/55">{tier.next ? t("home.toNext", { n: tier.toNext, tier: locale === "th" ? tier.next.nameTh : tier.next.name }) : t("home.maxTier")}</p>
            <Sparkles size={17} className="text-honey" />
          </div>
          <div className="mt-3"><ProgressBar value={tier.progress} tone="honey" /></div>
        </div>
      </div>

      <CultureStrip />

      <ScenePulse bagged={count} rank={rank} />

      <div className="grid grid-cols-3 gap-2.5">
        <MiniMetric label={t("card.specialty")} value={`${specialtyDone}/${specialty.length}`} tone="honey" />
        <MiniMetric label={t("card.roasters")} value={roastersDone} tone="jade" />
        <MiniMetric label={t("card.badges")} value={unlocked} tone="clay" />
      </div>

      <div className="scene-glow"><ViralTeaser
        label={t("home.viralLabel")}
        value={lastBag ? t("home.lastFlex", { cafe: localName(lastBag, locale) }) : t("home.firstFlex")}
        sub={t("home.viralSub")}
      /></div>

      <div className="grid grid-cols-[1fr_auto] gap-2.5">
        <Link href="/card" className="btn btn-honey btn-lg w-full">
          <Share2 size={18} />
          {t("home.shareCard")}
        </Link>
        <Link href="/map" className="btn btn-ink btn-lg w-14 px-0" aria-label={t("home.exploreMap")}>
          <MapIcon size={19} />
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="eyebrow">{t("home.trails")}</h2>
            <p className="mt-1 text-xs text-ink-soft">{t("home.trailsSub")}</p>
          </div>
          <Link href="/leaderboard" className="font-mono text-[11px] uppercase tracking-wide text-jade">{t("nav.board")}</Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {achievements.map((a) => <AchievementCard key={a.key} achievement={a} />)}
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">{t("home.nextStamp")}</h2>
        {busy ? <Skeleton className="h-[112px] w-full" /> : nextStamp ? (
          <div>
            <CafeTile cafe={nextStamp} bagged={false} />
            <p className="mt-2 text-[12px] text-ink-soft">{t("home.nextStampSub")}</p>
          </div>
        ) : (
          <div className="surface-luxe rounded-[26px] p-4 text-sm text-ink-soft">{t("home.allDone")}</div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="eyebrow">{t("home.collectionGrid")}</h2>
            <p className="mt-1 text-xs text-ink-soft">{Math.round(progress * 100)}% · {count}/{total}</p>
          </div>
          <Link href="/map" className="font-mono text-[11px] uppercase tracking-wide text-jade">{t("common.viewAll")}</Link>
        </div>
        {busy ? (
          <div className="grid grid-cols-4 gap-2.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}</div>
        ) : <StampGrid cafes={cafes} baggedIds={baggedIds} />}
      </section>

      <section>
        <h2 className="eyebrow mb-3">{t("home.recent")}</h2>
        {busy ? (
          <div className="space-y-2.5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[86px] w-full" />)}</div>
        ) : recent.length ? (
          <div className="space-y-2.5">{recent.map((c) => <CafeTile key={c.id} cafe={c} bagged />)}</div>
        ) : (
          <div className="surface-luxe rounded-[28px] p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-jade-wash text-jade"><Flame size={20} /></span>
            <p className="mt-3 font-semibold">{t("home.noRecent")}</p>
            <p className="mt-1 text-sm text-ink-soft">{t("home.startBagging")}</p>
            <Link href="/map" className="btn btn-primary btn-md mt-4"><MapIcon size={17} />{t("home.exploreMap")}</Link>
          </div>
        )}
      </section>

      <section className="hero-aurora rounded-[30px] p-5 text-cream">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-honey text-espresso"><Crown size={22} /></span>
          <div>
            <p className="font-semibold">{t("home.challenge")}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-cream/60">{t("home.challengeSub")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
