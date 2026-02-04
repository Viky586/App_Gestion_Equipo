import { Actor } from "@/application/dto/Actor";
import { MessageRepository } from "@/application/interfaces/MessageRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectMessage } from "@/domain/entities/ProjectMessage";

export interface PostProjectMessageInput {
  actor: Actor;
  projectId: string;
  content: string;
}

export class PostProjectMessage {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly memberRepo: ProjectMemberRepository,
    private readonly messageRepo: MessageRepository
  ) {}

  async execute(input: PostProjectMessageInput): Promise<ProjectMessage> {
    const content = input.content.trim();
    if (!content) {
      throw new ValidationError("El mensaje es obligatorio.");
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }

    if (input.actor.role !== "ADMIN") {
      const isMember = await this.memberRepo.isMember(
        input.projectId,
        input.actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("No perteneces a este proyecto.");
      }
    }

    return this.messageRepo.create({
      projectId: input.projectId,
      authorId: input.actor.userId,
      content,
    });
  }
}
