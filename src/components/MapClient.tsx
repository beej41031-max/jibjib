"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, LocateFixed, Star, X } from "lucide-react";
import type { Cafe } from "@/lib/types";
import { useT } from "@/i18n/provider";
import { tileGradient, initials, localName, localArea } from "@/lib/utils";
import { localBestDrink } from "@/lib/cafeMeta";

const UBON_CENTER = { lat: 15.2287, lng: 104.8566 };
const MIN_SPAN = { lat: 0.06, lng: 0.08 };
const PADDING = { lat: 0.025, lng: 0.035 };

type Point = { lat: number; lng: number };
type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mercY(lat: number) {
  const clamped = clamp(lat, -85.05112878, 85.05112878);
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function boundsFor(cafes: Cafe[]): Bounds {
  if (!cafes.length) {
    return {
      minLat: UBON_CENTER.lat - MIN_SPAN.lat / 2,
      maxLat: UBON_CENTER.lat + MIN_SPAN.lat / 2,
      minLng: UBON_CENTER.lng - MIN_SPAN.lng / 2,
      maxLng: UBON_CENTER.lng + MIN_SPAN.lng / 2,
    };
  }

  let minLat = Math.min(...cafes.map((c) => c.lat)) - PADDING.lat;
  let maxLat = Math.max(...cafes.map((c) => c.lat)) + PADDING.lat;
  let minLng = Math.min(...cafes.map((c) => c.lng)) - PADDING.lng;
  let maxLng = Math.max(...cafes.map((c) => c.lng)) + PADDING.lng;

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;
  if (latSpan < MIN_SPAN.lat) {
    const mid = (maxLat + minLat) / 2;
    minLat = mid - MIN_SPAN.lat / 2;
    maxLat = mid + MIN_SPAN.lat / 2;
  }
  if (lngSpan < MIN_SPAN.lng) {
    const mid = (maxLng + minLng) / 2;
    minLng = mid - MIN_SPAN.lng / 2;
    maxLng = mid + MIN_SPAN.lng / 2;
  }
  return { minLat, maxLat, minLng, maxLng };
}

function posInBounds(point: Point, bounds: Bounds) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const topY = mercY(bounds.maxLat);
  const bottomY = mercY(bounds.minLat);
  const y = ((topY - mercY(point.lat)) / (topY - bottomY)) * 100;
  return { x, y, visible: x >= 0 && x <= 100 && y >= 0 && y <= 100 };
}

function osmEmbedUrl(bounds: Bounds) {
  const bbox = [bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat]
    .map((n) => n.toFixed(6))
    .join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
}

function osmOpenUrl(cafe: Cafe) {
  return `https://www.openstreetmap.org/?mlat=${cafe.lat}&mlon=${cafe.lng}#map=18/${cafe.lat}/${cafe.lng}`;
}

function LocateButton({
  onLocate,
}: {
  onLocate: (p: { lat: number; lng: number }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const { t } = useT();
  return (
    <button
      onClick={() => {
        if (!navigator.geolocation) return;
        setBusy(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setBusy(false);
          },
          () => setBusy(false),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }}
      className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-cream text-jade shadow-lift active:scale-95"
      aria-label={t("map.you")}
    >
      <LocateFixed size={20} className={busy ? "animate-pulse" : ""} />
    </button>
  );
}

export function MapClient({
  cafes,
  baggedIds,
}: {
  cafes: Cafe[];
  baggedIds: Set<string>;
}) {
  const { t, locale } = useT();
  const [selected, setSelected] = useState<Cafe | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const bounds = useMemo(() => boundsFor(cafes), [cafes]);
  const embedUrl = useMemo(() => osmEmbedUrl(bounds), [bounds]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return (
    <div className="relative h-[66vh] overflow-hidden rounded-[26px] border border-line bg-espresso shadow-card">
      <iframe
        key={embedUrl}
        title="JibJib OpenStreetMap"
        src={embedUrl}
        className="absolute inset-0 h-full w-full border-0 grayscale-[0.18] saturate-[0.9] contrast-[0.96]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,92,66,0.16),transparent_32%),linear-gradient(180deg,rgba(33,23,17,0.05),rgba(33,23,17,0.18))]" />
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-cream/35 bg-espresso/72 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cream shadow-card backdrop-blur-md">
        OSM · no paid maps
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {cafes.map((cafe) => {
          const { x, y, visible } = posInBounds(cafe, bounds);
          if (!visible) return null;
          const bagged = baggedIds.has(cafe.id);
          const isSel = selected?.id === cafe.id;
          return (
            <button
              key={cafe.id}
              type="button"
              onClick={() => setSelected(cafe)}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-honey/55"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: isSel ? 50 : bagged ? 25 : 20 }}
              aria-label={localName(cafe, locale)}
            >
              {bagged ? (
                <span className={`grid place-items-center rounded-full bg-jade text-cream shadow-lift ring-2 ring-cream transition-all ${isSel ? "h-10 w-10" : "h-8 w-8"}`}>
                  <Check size={isSel ? 21 : 17} strokeWidth={3} />
                </span>
              ) : (
                <span className={`block rounded-full shadow-card ring-2 ring-cream transition-all ${cafe.is_specialty ? "bg-honey" : "bg-ink"} ${isSel ? "h-7 w-7 ring-4" : "h-5 w-5"}`} />
              )}
            </button>
          );
        })}

        {userPos && (() => {
          const { x, y, visible } = posInBounds(userPos, bounds);
          if (!visible) return null;
          return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%`, zIndex: 60 }}>
              <span className="absolute -left-2 -top-2 h-8 w-8 animate-pulse-ring rounded-full bg-sky-500/40" />
              <span className="relative block h-4 w-4 rounded-full bg-sky-500 ring-2 ring-cream" />
            </div>
          );
        })()}
      </div>

      <LocateButton onLocate={setUserPos} />

      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-40">
          <div className="surface animate-rise flex items-center gap-3 p-3 shadow-lift">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl" style={{ background: tileGradient(selected.name) }}>
              <span className="absolute left-1.5 top-1 font-mono text-[12px] font-bold text-cream/90">{initials(selected.name)}</span>
              {baggedIds.has(selected.id) && (
                <span className="absolute inset-0 grid place-items-center bg-jade/45">
                  <Check size={20} className="text-cream" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{localName(selected, locale)}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-soft">
                {localArea(selected, locale) && <span className="truncate">{localArea(selected, locale)}</span>}
                {selected.rating ? (
                  <span className="flex items-center gap-0.5"><Star size={11} className="fill-honey text-honey" />{selected.rating.toFixed(1)}</span>
                ) : null}
                {selected.price_band ? <span>{selected.price_band}</span> : null}
              </div>
              {localBestDrink(selected, locale) && <p className="mt-1 truncate text-[12px] text-ink-soft/75">{localBestDrink(selected, locale)}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <a href={osmOpenUrl(selected)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm hidden sm:inline-flex">OSM</a>
              <Link href={`/cafe/${selected.id}`} className="btn btn-primary btn-sm">
                {baggedIds.has(selected.id) ? t("common.bagged") : t("cafe.bagIt")}
                <ChevronRight size={15} />
              </Link>
            </div>
            <button onClick={() => setSelected(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft/60 hover:bg-ink/5" aria-label={t("common.cancel")}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
