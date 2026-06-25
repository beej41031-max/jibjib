"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map as MapIcon, List, Plus } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { MapClient } from "@/components/MapClient";
import { CafeTile, Loading, CultureStrip } from "@/components/ui";
import { cafeMatchesTrail } from "@/lib/achievements";
import type { Cafe } from "@/lib/types";

type Filter = "all" | "specialty" | "roaster" | "slowbar" | "laptop" | "date" | "unbagged";
type View = "map" | "list";

export default function MapPage() {
  const { t } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [baggedIds, setBaggedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("map");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const [cafesRes, bagsRes] = await Promise.all([
      supabase.from("cafes").select("*").order("is_specialty", { ascending: false }).order("name"),
      supabase.from("bags").select("cafe_id"),
    ]);
    setCafes((cafesRes.data as Cafe[]) ?? []);
    setBaggedIds(new Set(((bagsRes.data as { cafe_id: string }[]) ?? []).map((b) => b.cafe_id)));
    setBusy(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes.filter((c) => {
      const tagText = [...(c.tags ?? []), ...(c.trail_tags ?? [])].join(" ").toLowerCase();
      const hay = [c.name, c.name_th, c.area, c.area_th, c.best_drink, c.why_go, tagText].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || hay.includes(q);
      if (!matchesQuery) return false;
      if (filter === "specialty") return c.is_specialty;
      if (filter === "roaster") return cafeMatchesTrail(c, "roaster");
      if (filter === "slowbar") return cafeMatchesTrail(c, "slowbar");
      if (filter === "laptop") return cafeMatchesTrail(c, "laptop");
      if (filter === "date") return cafeMatchesTrail(c, "date");
      if (filter === "unbagged") return !baggedIds.has(c.id);
      return true;
    });
  }, [cafes, filter, baggedIds, query]);

  if (loading || !user) return <Loading />;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("map.all") },
    { key: "specialty", label: t("map.specialty") },
    { key: "roaster", label: t("map.roaster") },
    { key: "slowbar", label: t("map.slowbar") },
    { key: "laptop", label: t("map.laptop") },
    { key: "date", label: t("map.date") },
    { key: "unbagged", label: t("map.unbagged") },
  ];

  return (
    <div className="space-y-4">
      <div className="hero-aurora scene-glow chrome-edge rounded-[30px] p-4 text-cream">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <p className="font-thai text-[12px] font-semibold text-honey">{t("culture.tastePassport")} · Ubon field map</p>
            <h1 className="thai-pop-title mt-1 text-2xl font-black tracking-[-0.045em]">{t("map.title")}</h1>
            <p className="mt-1 text-[12px] text-cream/60">{t("map.resultCount", { n: filtered.length })}</p>
          </div>
          <div className="flex items-center gap-2">
          <Link href="/suggest" className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-cream/10 text-honey shadow-card backdrop-blur-md" aria-label={t("common.suggest")}>
            <Plus size={17} />
          </Link>
          <div className="inline-flex rounded-pill border border-cream/15 bg-cream/10 p-0.5 backdrop-blur-md">
              {[
                { v: "map" as View, icon: MapIcon },
                { v: "list" as View, icon: List },
              ].map(({ v, icon: Icon }) => (
                <button key={v} onClick={() => setView(v)} aria-label={v} className={`grid h-8 w-9 place-items-center rounded-pill transition-colors ${view === v ? "bg-honey text-espresso" : "text-cream/60"}`}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CultureStrip />

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("map.search")} className="field" />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`chip shrink-0 ${filter === f.key ? "chip-active" : ""}`}>{f.label}</button>
        ))}
      </div>

      {busy ? (
        <Loading />
      ) : view === "map" ? (
        <MapClient cafes={filtered} baggedIds={baggedIds} />
      ) : filtered.length > 0 ? (
        <div className="space-y-2.5">{filtered.map((c) => <CafeTile key={c.id} cafe={c} bagged={baggedIds.has(c.id)} />)}</div>
      ) : (
        <p className="py-12 text-center text-sm text-ink-soft">{t("map.empty")}</p>
      )}
    </div>
  );
}
