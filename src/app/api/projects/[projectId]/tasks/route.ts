import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createTaskSchema } from "@/presentation/validation/schemas";
import { CreateTask } from "@/application/use-cases/CreateTask";
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
      const isMember = await repos.members.isMember(projectId, actor.userId);
      if (!isMember) {
        throw new ForbiddenError("No perteneces a este proyecto.");
      }
    }
    const tasks = await repos.tasks.listByProject(projectId);
    const userIds = Array.from(
      new Set(tasks.flatMap((task) => [task.assignedTo, task.createdBy]))
    );
    const users = await repos.users.findByIds(userIds);
    const nameMap = new Map(
      users.map((user) => [user.id, user.fullName ?? user.email])
    );
    const data = tasks.map((task) => ({
      ...task,
      assignedToName: nameMap.get(task.assignedTo) ?? task.assignedTo,
      createdByName: nameMap.get(task.createdBy) ?? task.createdBy,
    }));
    return NextResponse.json({ data });
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
    const payload = createTaskSchema.parse(await request.json());
    const useCase = new CreateTask(
      repos.projects,
      repos.members,
      repos.tasks
    );
    const task = await useCase.execute({
      actor,
      projectId,
      title: payload.title,
      description: payload.description ?? null,
      assignedTo: payload.assignedTo,
    });
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
