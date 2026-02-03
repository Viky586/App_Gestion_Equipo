import { PostgrestError } from "@supabase/supabase-js";

export function assertSupabase(
  error: PostgrestError | null,
  context: string
) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}
