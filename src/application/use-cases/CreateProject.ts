import { Actor } from "@/application/dto/Actor";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ForbiddenError, ValidationError } from "@/domain/errors/AppError";
import { Project } from "@/domain/entities/Project";

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  actor: Actor;
}

export class CreateProject {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly memberRepo: ProjectMemberRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores pueden crear proyectos.");
    }
    const name = input.name.trim();
    if (!name) {
      throw new ValidationError("El nombre del proyecto es obligatorio.");
    }

    const project = await this.projectRepo.create({
      name,
      description: input.description ?? null,
      createdBy: input.actor.userId,
    });

    await this.memberRepo.addMember({
      projectId: project.id,
      userId: input.actor.userId,
      assignedBy: input.actor.userId,
    });

    return project;
  }
}
