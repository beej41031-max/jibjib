export type PriceBand = "฿" | "฿฿" | "฿฿฿";
export type QuietLevel = "calm" | "mixed" | "busy";
export type LaptopVibe = "yes" | "okay" | "no";

export type Cafe = {
  id: string;
  name: string;
  name_th: string | null;
  area: string | null;
  area_th: string | null;
  address: string | null;
  lat: number;
  lng: number;
  google_place_id: string | null;
  photo_url: string | null;
  rating: number | null;
  tags: string[];
  trail_tags: string[] | null;
  is_specialty: boolean;
  best_drink: string | null;
  best_drink_th: string | null;
  best_time: string | null;
  best_time_th: string | null;
  why_go: string | null;
  why_go_th: string | null;
  beans_note: string | null;
  beans_note_th: string | null;
  laptop_vibe: LaptopVibe | null;
  has_sockets: boolean | null;
  parking: string | null;
  parking_th: string | null;
  date_spot: boolean | null;
  price_band: PriceBand | null;
  quiet_level: QuietLevel | null;
  serious_score: number | null;
  photo_score: number | null;
  local_verified: boolean;
};

export type Bag = {
  id: string;
  user_id: string;
  cafe_id: string;
  bagged_at: string;
  lat: number | null;
  lng: number | null;
  note: string | null;
  drink: string | null;
  brew_method: string | null;
  verified: boolean;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  home_city: string | null;
};

export type LeaderRow = {
  user_id: string;
  username: string;
  display_name: string | null;
  bag_count: number;
  specialty_count?: number;
  roaster_count?: number;
  rank: number;
};

export type CafeSuggestion = {
  id: string;
  user_id: string;
  name: string;
  area: string | null;
  google_maps_url: string | null;
  note: string | null;
  created_at: string;
  status: "new" | "reviewed" | "added" | "rejected";
};
