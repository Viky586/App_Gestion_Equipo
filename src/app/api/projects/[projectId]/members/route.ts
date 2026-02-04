import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { assignUserSchema } from "@/presentation/validation/schemas";
import { AssignUserToProject } from "@/application/use-cases/AssignUserToProject";
import { ForbiddenError } from "@/domain/errors/AppError";
import { getUuidParam, RouteContext } from "@/presentation/routes/params";

export async function POST(
  request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const payload = assignUserSchema.parse(await request.json());
    const useCase = new AssignUserToProject(
      repos.projects,
      repos.users,
      repos.members
    );
    await useCase.execute({
      actor,
      projectId,
      userId: payload.userId,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

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
        throw new ForbiddenError("No perteneces a este proyecto.");
      }
    }
    const members = await repos.members.listMembers(projectId);
    return NextResponse.json({ data: members });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const payload = assignUserSchema.parse(await request.json());
    if (actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores.");
    }
    await repos.members.removeMember(projectId, payload.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
