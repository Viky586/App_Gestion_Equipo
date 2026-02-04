import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { updateTaskStatusSchema } from "@/presentation/validation/schemas";
import { UpdateTaskStatus } from "@/application/use-cases/UpdateTaskStatus";
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
    const useCase = new UpdateTaskStatus(repos.tasks);
    const task = await useCase.execute({
      actor,
      taskId,
      status: payload.status,
    });
    return NextResponse.json({ data: task });
  } catch (error) {
    return jsonError(error);
  }
}
