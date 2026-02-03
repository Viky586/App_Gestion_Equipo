import { redirect } from "next/navigation";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { Actor } from "@/application/dto/Actor";

export async function requireServerActor(): Promise<Actor> {
  try {
    const { supabase, repos } = await createRequestDependencies();
    return await requireActor(supabase, repos.users);
  } catch {
    redirect("/login");
  }
}

export async function requireAdminActor(): Promise<Actor> {
  const actor = await requireServerActor();
  if (actor.role !== "ADMIN") {
    redirect("/projects");
  }
  return actor;
}
