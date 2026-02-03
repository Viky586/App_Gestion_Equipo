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
      throw new ValidationError("Message content is required.");
    }

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    if (input.actor.role !== "ADMIN") {
      const isMember = await this.memberRepo.isMember(
        input.projectId,
        input.actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("Not a member of this project.");
      }
    }

    return this.messageRepo.create({
      projectId: input.projectId,
      authorId: input.actor.userId,
      content,
    });
  }
}
