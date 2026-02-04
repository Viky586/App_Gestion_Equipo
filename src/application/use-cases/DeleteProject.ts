import { Actor } from "@/application/dto/Actor";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface DeleteProjectInput {
  actor: Actor;
  projectId: string;
}

export class DeleteProject {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores pueden eliminar proyectos.");
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }

    await this.projectRepo.delete(input.projectId);
  }
}
