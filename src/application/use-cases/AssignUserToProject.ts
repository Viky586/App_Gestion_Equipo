import { Actor } from "@/application/dto/Actor";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { UserRepository } from "@/application/interfaces/UserRepository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/domain/errors/AppError";

export interface AssignUserToProjectInput {
  actor: Actor;
  projectId: string;
  userId: string;
}

export class AssignUserToProject {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly memberRepo: ProjectMemberRepository
  ) {}

  async execute(input: AssignUserToProjectInput): Promise<void> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError(
        "Solo administradores pueden asignar usuarios a proyectos."
      );
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }

    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado.");
    }

    const isMember = await this.memberRepo.isMember(
      input.projectId,
      input.userId
    );
    if (isMember) {
      throw new ConflictError("El usuario ya esta asignado al proyecto.");
    }

    await this.memberRepo.addMember({
      projectId: input.projectId,
      userId: input.userId,
      assignedBy: input.actor.userId,
    });
  }
}
