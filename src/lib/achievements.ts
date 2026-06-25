import type { Cafe } from "@/lib/types";

export type Achievement = {
  key: string;
  label: string;
  labelTh: string;
  short: string;
  shortTh: string;
  done: number;
  target: number;
  tone: "jade" | "honey" | "clay" | "ink";
};

function hasTag(cafe: Cafe, tag: string) {
  const tags = [...(cafe.tags ?? []), ...(cafe.trail_tags ?? [])].map((t) =>
    t.toLowerCase()
  );
  return tags.includes(tag.toLowerCase());
}

function count(cafes: Cafe[], baggedIds: Set<string>, pred: (c: Cafe) => boolean) {
  const total = cafes.filter(pred).length;
  const done = cafes.filter((c) => pred(c) && baggedIds.has(c.id)).length;
  return { done, total };
}

export function achievementStats(cafes: Cafe[], baggedIds: Set<string>): Achievement[] {
  const roaster = count(cafes, baggedIds, (c) => c.is_specialty || hasTag(c, "roaster"));
  const slowBar = count(cafes, baggedIds, (c) =>
    hasTag(c, "pourover") || hasTag(c, "filter") || hasTag(c, "slowbar")
  );
  const laptop = count(cafes, baggedIds, (c) => c.laptop_vibe === "yes" || hasTag(c, "workspace"));
  const date = count(cafes, baggedIds, (c) => Boolean(c.date_spot) || hasTag(c, "date"));
  const classic = count(cafes, baggedIds, (c) => hasTag(c, "classic") || hasTag(c, "breakfast"));

  const items: Achievement[] = [
    {
      key: "roaster",
      label: "Roaster run",
      labelTh: "สายโรงคั่ว",
      short: "roasters",
      shortTh: "โรงคั่ว",
      done: roaster.done,
      target: Math.max(1, roaster.total),
      tone: "honey",
    },
    {
      key: "slowbar",
      label: "Slow bar trail",
      labelTh: "เส้นทาง Slow Bar",
      short: "slow bars",
      shortTh: "slow bar",
      done: slowBar.done,
      target: Math.max(1, slowBar.total),
      tone: "jade",
    },
    {
      key: "laptop",
      label: "Laptop safe",
      labelTh: "นั่งทำงานได้",
      short: "work cafes",
      shortTh: "ร้านทำงาน",
      done: laptop.done,
      target: Math.max(1, laptop.total),
      tone: "ink",
    },
    {
      key: "date",
      label: "Date spots",
      labelTh: "ร้านเดต",
      short: "date spots",
      shortTh: "ร้านเดต",
      done: date.done,
      target: Math.max(1, date.total),
      tone: "clay",
    },
    {
      key: "classic",
      label: "Old Ubon cup",
      labelTh: "กาแฟอุบลรุ่นเก่า",
      short: "classics",
      shortTh: "ร้านคลาสสิก",
      done: classic.done,
      target: Math.max(1, classic.total),
      tone: "honey",
    },
  ];
  return items.filter((a) => a.target > 1);
}

export function unlockedAchievements(achievements: Achievement[]) {
  return achievements.filter((a) => a.done >= a.target);
}

export function cafeMatchesTrail(cafe: Cafe, trailKey: string) {
  if (trailKey === "roaster") return cafe.is_specialty || hasTag(cafe, "roaster");
  if (trailKey === "slowbar") return hasTag(cafe, "pourover") || hasTag(cafe, "filter") || hasTag(cafe, "slowbar");
  if (trailKey === "laptop") return cafe.laptop_vibe === "yes" || hasTag(cafe, "workspace");
  if (trailKey === "date") return Boolean(cafe.date_spot) || hasTag(cafe, "date");
  if (trailKey === "classic") return hasTag(cafe, "classic") || hasTag(cafe, "breakfast");
  return false;
}
