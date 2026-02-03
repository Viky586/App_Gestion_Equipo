import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createNoteSchema } from "@/presentation/validation/schemas";
import { CreateNote } from "@/application/use-cases/CreateNote";
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
    const notes = await repos.notes.listByProject(projectId);
    return NextResponse.json({ data: notes });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const payload = createNoteSchema.parse(await request.json());
    const useCase = new CreateNote(
      repos.projects,
      repos.members,
      repos.notes
    );
    const note = await useCase.execute({
      actor,
      projectId,
      title: payload.title,
      content: payload.content,
    });
    return NextResponse.json({ data: note }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
