import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nopvgdaiozxjdzpuwoxk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZnZGFpb3p4amR6cHV3b3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjU5NjgsImV4cCI6MjEwNTY0MTk2OH0.oWdngn9xzQPuitK6KOrqZpuaAAOhRUnZXQL5qWgWGb4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
