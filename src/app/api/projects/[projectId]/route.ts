import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { updateProjectSchema } from "@/presentation/validation/schemas";
import { UpdateProject } from "@/application/use-cases/UpdateProject";
import { DeleteProject } from "@/application/use-cases/DeleteProject";
import { ForbiddenError } from "@/domain/errors/AppError";
import { getUuidParam, RouteContext } from "@/presentation/routes/params";

export async function GET(
  _request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    if (actor.role !== "ADMIN") {
      const isMember = await repos.members.isMember(
        projectId,
        actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("Not a member of this project.");
      }
    }
    const project = await repos.projects.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found." } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: project });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const payload = updateProjectSchema.parse(await request.json());
    const useCase = new UpdateProject(repos.projects);
    const project = await useCase.execute({
      actor,
      projectId,
      name: payload.name,
      description: payload.description ?? undefined,
    });
    return NextResponse.json({ data: project });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const useCase = new DeleteProject(repos.projects);
    await useCase.execute({ actor, projectId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
