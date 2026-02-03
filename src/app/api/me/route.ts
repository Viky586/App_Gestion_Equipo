import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";

export async function GET() {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const profile = await repos.users.findById(actor.userId);
    return NextResponse.json({ data: profile });
  } catch (error) {
    return jsonError(error);
  }
}
