import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  type CookieOptions = Record<string, string | number | boolean | Date | undefined>;
  type CookieStoreWithSet = {
    set: (cookie: { name: string; value: string } & CookieOptions) => void;
  };
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        if ("set" in cookieStore) {
          (cookieStore as CookieStoreWithSet).set({ name, value, ...options });
        }
      },
      remove(name: string, options: CookieOptions) {
        if ("set" in cookieStore) {
          (cookieStore as CookieStoreWithSet).set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
