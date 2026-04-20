import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// v1 stub: client is wired to env vars but no methods are called anywhere.
// v2 will replace mock data lookups with supabase queries against this client.
export const supabase = createClient(url, anonKey);
