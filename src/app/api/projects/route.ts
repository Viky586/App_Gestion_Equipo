import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createProjectSchema } from "@/presentation/validation/schemas";
import { CreateProject } from "@/application/use-cases/CreateProject";

export async function GET() {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projects = await repos.projects.listForUser(actor.userId);
    return NextResponse.json({ data: projects });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const payload = createProjectSchema.parse(await request.json());
    const useCase = new CreateProject(repos.projects, repos.members);
    const project = await useCase.execute({
      actor,
      name: payload.name,
      description: payload.description ?? null,
    });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
