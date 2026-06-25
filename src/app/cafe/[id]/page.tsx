"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Star, ShieldCheck, Coffee, Loader2, Navigation, Users, ExternalLink, Clock, Laptop, Car, PlugZap, Heart, Camera, Gauge, AlertTriangle } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Loading, MiniMetric } from "@/components/ui";
import { tileGradient, initials, localName, localArea, formatDate } from "@/lib/utils";
import { distanceMeters, formatDistance, bagRadius } from "@/lib/geo";
import { laptopLabel, localBeansNote, localBestDrink, localBestTime, localParking, localWhyGo, priceLabel, quietLabel, scoreLabel } from "@/lib/cafeMeta";
import type { Cafe, Bag } from "@/lib/types";

type Status = "idle" | "locating" | "toofar" | "denied" | "bagging" | "done" | "error";

export default function CafePage() {
  const { t, locale } = useT();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [myBag, setMyBag] = useState<Bag | null>(null);
  const [baggers, setBaggers] = useState<number>(0);
  const [busy, setBusy] = useState(true);
  const [note, setNote] = useState("");
  const [drink, setDrink] = useState("");
  const [brewMethod, setBrewMethod] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [dist, setDist] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    if (!user || !params.id) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const [cafeRes, bagRes] = await Promise.all([
      supabase.from("cafes").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("bags").select("*").eq("cafe_id", params.id).eq("user_id", user.id).maybeSingle(),
    ]);
    setCafe((cafeRes.data as Cafe) ?? null);
    setMyBag((bagRes.data as Bag) ?? null);
    if (bagRes.data) setStatus("done");

    try {
      const { data } = await supabase.rpc("get_cafe_baggers", { cafe: params.id });
      setBaggers(typeof data === "number" ? data : 0);
    } catch {
      setBaggers(0);
    }
    setBusy(false);
  }, [user, params.id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    if (!cafe || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setDist(distanceMeters({ lat: pos.coords.latitude, lng: pos.coords.longitude }, { lat: cafe.lat, lng: cafe.lng })),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [cafe]);

  function bag() {
    if (!cafe || !user) return;
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = distanceMeters(here, { lat: cafe.lat, lng: cafe.lng });
        setDist(d);
        if (d > bagRadius()) {
          setStatus("toofar");
          return;
        }
        setStatus("bagging");
        const supabase = getSupabaseBrowser();
        const { data, error } = await supabase
          .from("bags")
          .insert({
            user_id: user.id,
            cafe_id: cafe.id,
            lat: here.lat,
            lng: here.lng,
            verified: true,
            note: note.trim() || null,
            drink: drink.trim() || null,
            brew_method: brewMethod.trim() || null,
          })
          .select()
          .single();
        if (error) {
          setStatus("error");
          return;
        }
        setMyBag(data as Bag);
        setBaggers((b) => b + 1);
        setStatus("done");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  if (loading || !user || busy) return <Loading />;

  if (!cafe) {
    return (
      <div className="space-y-4">
        <BackBar />
        <p className="py-12 text-center text-sm text-ink-soft">{t("cafe.notFound")}</p>
      </div>
    );
  }

  const bagged = Boolean(myBag);
  const radius = bagRadius();
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${cafe.lat}&mlon=${cafe.lng}#map=18/${cafe.lat}/${cafe.lng}`;
  const bestDrink = localBestDrink(cafe, locale);
  const bestTime = localBestTime(cafe, locale);
  const whyGo = localWhyGo(cafe, locale);
  const beans = localBeansNote(cafe, locale);
  const parking = localParking(cafe, locale);

  return (
    <div className="space-y-5">
      <BackBar />

      <div className="relative flex h-56 items-end overflow-hidden rounded-[28px] shadow-card scene-glow chrome-edge" style={{ background: cafe.photo_url ? undefined : tileGradient(cafe.name) }}>
        {cafe.photo_url ? <img src={cafe.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <span className="absolute right-4 top-4 font-mono text-6xl font-bold text-cream/20">{initials(cafe.name)}</span>
        <Coffee size={140} strokeWidth={1} className="absolute -bottom-7 -left-5 text-cream/10" />
        {bagged && (
          <span className="animate-stamp-in absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-cream/95 shadow-lift">
            <Check size={26} className="text-jade" strokeWidth={3} />
          </span>
        )}
        <div className="relative w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16">
          <div className="flex flex-wrap items-center gap-1.5">
            {cafe.is_specialty && <span className="rounded-pill bg-honey px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-espresso">{t("common.specialty")}</span>}
            {cafe.local_verified ? <span className="rounded-pill bg-jade px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-cream">{t("common.verified")}</span> : null}
            {cafe.tags?.slice(0, 4).map((tag) => <span key={tag} className="rounded-pill bg-cream/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-cream backdrop-blur-sm">{tag}</span>)}
          </div>
          <h1 className="thai-pop-title mt-2 text-3xl font-black leading-tight">{localName(cafe, locale)}</h1>
        </div>
      </div>

      {!cafe.local_verified && (
        <div className="rounded-2xl border border-honey/40 bg-honey-wash px-4 py-3 text-sm text-honey-deep">
          <div className="flex gap-2">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <p>{t("cafe.needVerify")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
        {localArea(cafe, locale) && <span className="flex items-center gap-1.5"><MapPin size={15} />{localArea(cafe, locale)}</span>}
        {cafe.rating ? <span className="flex items-center gap-1"><Star size={14} className="fill-honey text-honey" />{cafe.rating.toFixed(1)}</span> : null}
        {dist !== null && <span className="flex items-center gap-1.5"><Navigation size={14} />{formatDistance(dist)}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <MiniMetric label={t("cafe.serious")} value={scoreLabel(cafe.serious_score)} tone="honey" />
        <MiniMetric label={t("cafe.photo")} value={scoreLabel(cafe.photo_score)} tone="clay" />
        <MiniMetric label={t("cafe.price")} value={priceLabel(cafe.price_band)} tone="jade" />
      </div>

      <section className="trend-card space-y-4 rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="eyebrow">{t("cafe.fieldNotes")}</h2>
          <div className="flex items-center gap-2 text-sm text-ink-soft"><Users size={15} />{baggers <= 0 ? t("cafe.noBaggers") : baggers === 1 ? t("cafe.oneBagger") : t("cafe.baggers", { n: baggers })}</div>
        </div>
        {whyGo && <Field label={t("cafe.whyGo")} value={whyGo} icon={<Coffee size={16} />} />}
        {bestDrink && <Field label={t("cafe.bestDrink")} value={bestDrink} icon={<Star size={16} />} />}
        {bestTime && <Field label={t("cafe.bestTime")} value={bestTime} icon={<Clock size={16} />} />}
        {beans && <Field label={t("cafe.beans")} value={beans} icon={<Gauge size={16} />} />}
      </section>

      <section className="trend-card rounded-[28px] p-5">
        <h2 className="eyebrow mb-4">{t("cafe.vibe")}</h2>
        <div className="grid grid-cols-2 gap-2.5 text-sm">
          <Vibe icon={<Laptop size={16} />} label={t("cafe.laptop")} value={laptopLabel(cafe.laptop_vibe, locale)} />
          <Vibe icon={<PlugZap size={16} />} label={t("cafe.sockets")} value={cafe.has_sockets == null ? "—" : cafe.has_sockets ? t("cafe.yes") : t("cafe.no")} />
          <Vibe icon={<Car size={16} />} label={t("cafe.parking")} value={parking ?? "—"} />
          <Vibe icon={<Heart size={16} />} label={t("cafe.dateSpot")} value={cafe.date_spot == null ? "—" : cafe.date_spot ? t("cafe.yes") : t("cafe.no")} />
          <Vibe icon={<Camera size={16} />} label={t("cafe.quiet")} value={quietLabel(cafe.quiet_level, locale)} />
          <Vibe icon={<MapPin size={16} />} label={t("common.openMaps")} value={<a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-jade">OSM <ExternalLink size={12} /></a>} />
        </div>
      </section>

      {cafe.address && <p className="text-sm leading-relaxed text-ink-soft">{cafe.address}</p>}

      <div className="hairline" />

      {bagged ? (
        <div className="trend-card rounded-[28px] space-y-3 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-jade-wash"><Check size={24} className="text-jade" strokeWidth={3} /></span>
            <div>
              <p className="font-semibold">{t("cafe.bagged")}</p>
              {myBag && <p className="text-sm text-ink-soft">{t("cafe.baggedOn", { date: formatDate(myBag.bagged_at, locale) })}</p>}
            </div>
          </div>
          {myBag?.verified && <div className="flex items-center gap-1.5 text-[13px] font-medium text-jade"><ShieldCheck size={15} />{t("cafe.verified")}</div>}
          {(myBag?.drink || myBag?.brew_method) && <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink">{[myBag?.drink, myBag?.brew_method].filter(Boolean).join(" · ")}</p>}
          {myBag?.note && <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink">{myBag.note}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <input value={drink} onChange={(e) => setDrink(e.target.value)} placeholder={t("cafe.drinkPlaceholder")} className="field" aria-label={t("cafe.drinkLabel")} />
          <input value={brewMethod} onChange={(e) => setBrewMethod(e.target.value)} placeholder={t("cafe.methodPlaceholder")} className="field" aria-label={t("cafe.methodLabel")} />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("cafe.notePlaceholder")} className="field min-h-[92px] resize-none py-3" aria-label={t("cafe.addNote")} />
          <button onClick={bag} disabled={status === "locating" || status === "bagging"} className="btn btn-primary btn-lg w-full">
            {status === "locating" ? <><Loader2 size={18} className="animate-spin" />{t("cafe.locating")}</> : status === "bagging" ? <><Loader2 size={18} className="animate-spin" />{t("cafe.checking")}</> : <><Check size={18} strokeWidth={3} />{t("cafe.bagIt")}</>}
          </button>
          {status === "toofar" && dist !== null && <div className="rounded-2xl bg-honey-wash px-4 py-3 text-sm text-honey-deep"><p className="font-medium">{t("cafe.tooFar", { dist: formatDistance(dist) })}</p><p className="text-honey-deep/80">{t("cafe.getCloser", { radius })}</p></div>}
          {status === "denied" && <div className="flex flex-col gap-2 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay"><span>{t("cafe.locationDenied")}</span><button onClick={bag} className="self-start font-medium underline">{t("cafe.retry")}</button></div>}
          {status === "error" && <p className="text-center text-sm text-clay">{t("login.error")}</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-jade">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-soft">{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink">{value}</p>
      </div>
    </div>
  );
}

function Vibe({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper px-3 py-3">
      <div className="flex items-center gap-1.5 text-ink-soft">{icon}<span className="font-mono text-[10px] uppercase tracking-wide">{label}</span></div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function BackBar() {
  const { t } = useT();
  return (
    <Link href="/map" className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wide text-ink-soft">
      <ArrowLeft size={15} />
      {t("common.back")}
    </Link>
  );
}
