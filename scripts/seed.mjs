import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[key] = v;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const cafes = JSON.parse(readFileSync(new URL("../supabase/seed-cafes.json", import.meta.url), "utf8"));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function cafeRow(cafe) {
  if (typeof cafe.lat !== "number" || typeof cafe.lng !== "number") throw new Error("missing manual lat/lng");
  return {
    name: cafe.name,
    name_th: cafe.name_th ?? null,
    area: cafe.area ?? null,
    area_th: cafe.area_th ?? null,
    address: cafe.address ?? null,
    lat: cafe.lat,
    lng: cafe.lng,
    google_place_id: cafe.google_place_id ?? `manual:${slug(cafe.name)}`,
    rating: cafe.rating ?? null,
    photo_url: cafe.photo_url ?? null,
    tags: cafe.tags ?? [],
    trail_tags: cafe.trail_tags ?? [],
    is_specialty: cafe.is_specialty ?? false,
    best_drink: cafe.best_drink ?? null,
    best_drink_th: cafe.best_drink_th ?? null,
    best_time: cafe.best_time ?? null,
    best_time_th: cafe.best_time_th ?? null,
    why_go: cafe.why_go ?? null,
    why_go_th: cafe.why_go_th ?? null,
    beans_note: cafe.beans_note ?? null,
    beans_note_th: cafe.beans_note_th ?? null,
    laptop_vibe: cafe.laptop_vibe ?? null,
    has_sockets: cafe.has_sockets ?? null,
    parking: cafe.parking ?? null,
    parking_th: cafe.parking_th ?? null,
    date_spot: cafe.date_spot ?? null,
    price_band: cafe.price_band ?? null,
    quiet_level: cafe.quiet_level ?? null,
    serious_score: cafe.serious_score ?? null,
    photo_score: cafe.photo_score ?? null,
    local_verified: cafe.local_verified ?? false,
  };
}

async function main() {
  let ok = 0;
  const failed = [];
  for (const cafe of cafes) {
    try {
      const row = cafeRow(cafe);
      const { error } = await supabase.from("cafes").upsert(row, { onConflict: "google_place_id" });
      if (error) {
        failed.push(cafe.name);
        console.log(`fail  ${cafe.name}: ${error.message}`);
      } else {
        ok++;
        console.log(`ok    ${cafe.name}  (${row.lat.toFixed(4)}, ${row.lng.toFixed(4)})`);
      }
    } catch (e) {
      failed.push(cafe.name);
      console.log(`error ${cafe.name}: ${e.message}`);
    }
  }
  console.log(`\nseeded ${ok}/${cafes.length} cafes`);
  if (failed.length) console.log(`not seeded: ${failed.join(", ")}`);
  console.log("\nNo Google/Places calls were made. Next: manually verify every pin in Ubon and set local_verified=true when checked.");
}
main().catch((e) => { console.error(e); process.exit(1); });
