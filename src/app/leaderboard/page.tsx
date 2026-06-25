"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Coffee } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Loading, CultureStrip } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { LeaderRow } from "@/lib/types";

type Mode = "all" | "month";

export default function LeaderboardPage() {
  const { t } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [mode, setMode] = useState<Mode>("all");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    try {
      const { data } = await supabase.rpc(mode === "month" ? "get_monthly_leaderboard" : "get_leaderboard", { city: null, limit_n: 100 });
      setRows((data as LeaderRow[]) ?? []);
    } catch {
      setRows([]);
    }
    setBusy(false);
  }, [user, mode]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (loading || !user) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="hero-aurora scene-glow chrome-edge rounded-[30px] p-5 text-cream">
        <div className="relative z-10">
          <p className="font-thai text-[12px] font-semibold text-honey">{t("culture.madeInUbon")} · Ubon hunter board</p>
          <h1 className="thai-pop-title mt-1 text-[30px] font-black leading-none tracking-[-0.055em]">{t("board.title")}</h1>
          <p className="mt-2 text-sm text-cream/60">{t("board.sub")}</p>
        </div>
      </div>

      <CultureStrip />

      <div className="surface-luxe inline-flex rounded-pill p-1">
        {[
          { key: "all" as Mode, label: t("board.allTime") },
          { key: "month" as Mode, label: t("board.month") },
        ].map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)} className={cn("rounded-pill px-4 py-2 text-[12px] font-medium transition-colors", mode === m.key ? "bg-ink text-cream shadow-card" : "text-ink-soft")}>{m.label}</button>
        ))}
      </div>

      {busy ? (
        <Loading />
      ) : rows.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-8 text-center">
          <Coffee className="text-jade" />
          <p className="text-sm text-ink-soft">{t("board.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => <Row key={r.user_id} row={r} me={r.user_id === user.id} t={t} />)}
        </div>
      )}
    </div>
  );
}

function Row({ row, me, t }: { row: LeaderRow; me: boolean; t: (k: string, vars?: Record<string, string | number>) => string }) {
  const top = Number(row.rank) <= 3;
  return (
    <div className={cn("surface-luxe flex items-center gap-3 rounded-[26px] p-3.5 transition-colors", me && "border-jade/60 bg-jade-wash")}>
      <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-sm font-black", top ? "bg-honey text-espresso shadow-stamp" : "bg-paper text-ink-soft")}>
        {top ? <Trophy size={17} /> : row.rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-tight">
          {row.display_name || row.username}
          {me && <span className="ml-2 rounded-pill bg-jade px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-cream">{t("board.you")}</span>}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-ink-soft">
          <span>{row.specialty_count ?? 0} {t("board.specialty")}</span>
          <span>·</span>
          <span>{row.roaster_count ?? 0} {t("board.roasters")}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="stat-num text-2xl font-semibold leading-none">{row.bag_count}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">{t("board.bags")}</p>
      </div>
    </div>
  );
}
