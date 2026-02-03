"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browser";

export function useSupabaseClient() {
  return useMemo(() => createSupabaseBrowserClient(), []);
}
