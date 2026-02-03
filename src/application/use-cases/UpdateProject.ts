import { Actor } from "@/application/dto/Actor";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { Project } from "@/domain/entities/Project";

export interface UpdateProjectInput {
  actor: Actor;
  projectId: string;
  name?: string;
  description?: string | null;
}

export class UpdateProject {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can update projects.");
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new ValidationError("Project name cannot be empty.");
    }

    return this.projectRepo.update(input.projectId, {
      name: input.name?.trim(),
      description:
        input.description !== undefined ? input.description : undefined,
    });
  }
}
