import { redirect } from "next/navigation";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";

export default async function Home() {
  const { supabase, repos } = await createRequestDependencies();
  try {
    const actor = await requireActor(supabase, repos.users);
    if (actor.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/projects");
  } catch {
    redirect("/login");
  }
}
