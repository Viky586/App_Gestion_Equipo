import { Actor } from "@/application/dto/Actor";
import { TaskRepository } from "@/application/interfaces/TaskRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";
import { ProjectTask, TaskStatus } from "@/domain/entities/ProjectTask";

export interface UpdateTaskStatusInput {
  actor: Actor;
  taskId: string;
  status: TaskStatus;
}

export class UpdateTaskStatus {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(input: UpdateTaskStatusInput): Promise<ProjectTask> {
    const task = await this.taskRepo.findById(input.taskId);
    if (!task) {
      throw new NotFoundError("Tarea no encontrada.");
    }
    if (task.assignedTo !== input.actor.userId) {
      throw new ForbiddenError("Solo el responsable puede actualizar la tarea.");
    }
    return this.taskRepo.updateStatus(input.taskId, input.status);
  }
}
