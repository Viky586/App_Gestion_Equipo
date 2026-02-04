import { Actor } from "@/application/dto/Actor";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { TaskRepository } from "@/application/interfaces/TaskRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectTask } from "@/domain/entities/ProjectTask";

export interface CreateTaskInput {
  actor: Actor;
  projectId: string;
  title: string;
  description?: string | null;
  assignedTo: string;
}

export class CreateTask {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly memberRepo: ProjectMemberRepository,
    private readonly taskRepo: TaskRepository
  ) {}

  async execute(input: CreateTaskInput): Promise<ProjectTask> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores pueden crear tareas.");
    }
    if (!input.title.trim()) {
      throw new ValidationError("El titulo es obligatorio.");
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }

    const isMember = await this.memberRepo.isMember(
      input.projectId,
      input.assignedTo
    );
    if (!isMember) {
      throw new ValidationError("El usuario no pertenece al proyecto.");
    }

    return this.taskRepo.create({
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      status: "PENDING",
      assignedTo: input.assignedTo,
      createdBy: input.actor.userId,
    });
  }
}
