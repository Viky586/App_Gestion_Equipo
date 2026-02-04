import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { updateTaskStatusSchema } from "@/presentation/validation/schemas";
import { UpdateTask } from "@/application/use-cases/UpdateTask";
import { DeleteTask } from "@/application/use-cases/DeleteTask";
import { getUuidParam, RouteContext } from "@/presentation/routes/params";

export async function PATCH(
  request: Request,
  { params }: RouteContext<{ projectId: string; taskId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const taskId = await getUuidParam(params, "taskId");
    const payload = updateTaskStatusSchema.parse(await request.json());
    const useCase = new UpdateTask(repos.tasks, repos.members);
    const task = await useCase.execute({
      actor,
      taskId,
      status: payload.status,
      assignedTo: payload.assignedTo,
      archived: payload.archived,
    });
    return NextResponse.json({ data: task });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<{ projectId: string; taskId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const taskId = await getUuidParam(params, "taskId");
    const useCase = new DeleteTask(repos.tasks);
    await useCase.execute({ actor, taskId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
