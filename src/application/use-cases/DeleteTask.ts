import { Actor } from "@/application/dto/Actor";
import { TaskRepository } from "@/application/interfaces/TaskRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface DeleteTaskInput {
  actor: Actor;
  taskId: string;
}

export class DeleteTask {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores pueden eliminar tareas.");
    }
    const task = await this.taskRepo.findById(input.taskId);
    if (!task) {
      throw new NotFoundError("Tarea no encontrada.");
    }
    await this.taskRepo.delete(input.taskId);
  }
}
