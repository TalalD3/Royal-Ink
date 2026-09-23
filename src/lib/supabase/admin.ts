import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nopvgdaiozxjdzpuwoxk.supabase.co";
// Fallback to public anon key during build or if service role is not provided
const fallbackKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZnZGFpb3p4amR6cHV3b3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjU5NjgsImV4cCI6MjEwNTY0MTk2OH0.oWdngn9xzQPuitK6KOrqZpuaAAOhRUnZXQL5qWgWGb4";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
