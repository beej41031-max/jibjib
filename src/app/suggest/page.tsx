"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Loading, CultureStrip } from "@/components/ui";

export default function SuggestPage() {
  const { t } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [maps, setMaps] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function submit() {
    if (!user || !name.trim()) return;
    setBusy(true);
    setError(false);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.from("cafe_suggestions").insert({
      user_id: user.id,
      name: name.trim(),
      area: area.trim() || null,
      google_maps_url: maps.trim() || null,
      note: note.trim() || null,
    });
    setBusy(false);
    if (error) {
      setError(true);
      return;
    }
    setSent(true);
    setName("");
    setArea("");
    setMaps("");
    setNote("");
  }

  if (loading || !user) return <Loading />;

  return (
    <div className="space-y-5">
      <Link href="/map" className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wide text-ink-soft">
        <ArrowLeft size={15} />
        {t("common.back")}
      </Link>

      <div className="hero-aurora scene-glow chrome-edge rounded-[30px] p-5 text-cream">
        <div className="relative z-10">
          <p className="font-thai text-[12px] font-semibold text-honey">{t("culture.madeInUbon")}</p>
          <h1 className="thai-pop-title mt-1 text-2xl font-black tracking-tight">{t("suggest.title")}</h1>
          <p className="mt-2 text-sm text-cream/60">{t("suggest.sub")}</p>
        </div>
      </div>

      <CultureStrip />

      {sent && (
        <div className="rounded-2xl border border-jade/30 bg-jade-wash px-4 py-3 text-sm text-jade">
          <div className="flex items-center gap-2"><Check size={17} />{t("suggest.sent")}</div>
        </div>
      )}

      <div className="trend-card rounded-[28px] space-y-3 p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("suggest.name")} className="field" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder={t("suggest.area")} className="field" />
        <input value={maps} onChange={(e) => setMaps(e.target.value)} placeholder={t("suggest.maps")} className="field" />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("suggest.note")} className="field min-h-[120px] resize-none py-3" />
        <button onClick={submit} disabled={busy || !name.trim()} className="btn btn-primary btn-lg w-full">
          {busy ? <><Loader2 size={18} className="animate-spin" />{t("login.sending")}</> : t("suggest.send")}
        </button>
        {error && <p className="text-center text-sm text-clay">{t("login.error")}</p>}
      </div>
    </div>
  );
}
