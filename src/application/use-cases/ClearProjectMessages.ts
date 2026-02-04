import { Actor } from "@/application/dto/Actor";
import { MessageRepository } from "@/application/interfaces/MessageRepository";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface ClearProjectMessagesInput {
  actor: Actor;
  projectId: string;
}

export class ClearProjectMessages {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly messageRepo: MessageRepository
  ) {}

  async execute(input: ClearProjectMessagesInput): Promise<void> {
    if (!input.actor.isPrimaryAdmin) {
      throw new ForbiddenError(
        "Solo el admin principal puede vaciar el chat."
      );
    }
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }
    await this.messageRepo.deleteByProject(input.projectId);
  }
}
