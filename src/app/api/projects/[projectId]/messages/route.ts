import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createMessageSchema } from "@/presentation/validation/schemas";
import { PostProjectMessage } from "@/application/use-cases/PostProjectMessage";
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
    const messages = await repos.messages.listByProject(projectId);
    return NextResponse.json({ data: messages });
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
    const payload = createMessageSchema.parse(await request.json());
    const useCase = new PostProjectMessage(
      repos.projects,
      repos.members,
      repos.messages
    );
    const message = await useCase.execute({
      actor,
      projectId,
      content: payload.content,
    });
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
