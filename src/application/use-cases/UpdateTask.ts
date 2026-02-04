import { Actor } from "@/application/dto/Actor";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { TaskRepository } from "@/application/interfaces/TaskRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectTask, TaskStatus } from "@/domain/entities/ProjectTask";

export interface UpdateTaskInput {
  actor: Actor;
  taskId: string;
  status?: TaskStatus;
  assignedTo?: string;
}

export class UpdateTask {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly memberRepo: ProjectMemberRepository
  ) {}

  async execute(input: UpdateTaskInput): Promise<ProjectTask> {
    if (!input.status && !input.assignedTo) {
      throw new ValidationError("No hay cambios para actualizar.");
    }
    const task = await this.taskRepo.findById(input.taskId);
    if (!task) {
      throw new NotFoundError("Tarea no encontrada.");
    }

    const isAdmin = input.actor.role === "ADMIN";
    const isAssignee = task.assignedTo === input.actor.userId;
    if (!isAdmin && !isAssignee) {
      throw new ForbiddenError(
        "Solo el responsable o un administrador puede actualizar la tarea."
      );
    }

    if (input.assignedTo) {
      if (!isAdmin) {
        throw new ForbiddenError(
          "Solo administradores pueden reasignar tareas."
        );
      }
      const isMember = await this.memberRepo.isMember(
        task.projectId,
        input.assignedTo
      );
      if (!isMember) {
        throw new ValidationError("El usuario no pertenece al proyecto.");
      }
    }

    if (input.status) {
      if (!isAdmin && !isAssignee) {
        throw new ForbiddenError(
          "Solo el responsable puede cambiar el estado."
        );
      }
      await this.taskRepo.updateStatus(input.taskId, input.status);
    }

    if (input.assignedTo) {
      await this.taskRepo.updateAssignee(input.taskId, input.assignedTo);
    }

    const updated = await this.taskRepo.findById(input.taskId);
    if (!updated) {
      throw new NotFoundError("Tarea no encontrada.");
    }
    return updated;
  }
}
