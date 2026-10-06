/* A point of sale as the admin screens and the map receive it from the
   API (snake_case, the shape the admin UI and Excel tools were built on) */
export interface DbDistributor {
  id: string;
  created_at: string;
  name: string;
  wilaya_code: number;
  badge: "headquarters" | "premium" | "authorized" | "standard";
  location_url?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active: boolean;
}
