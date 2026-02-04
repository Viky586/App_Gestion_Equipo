import { Actor } from "@/application/dto/Actor";
import { NoteRepository } from "@/application/interfaces/NoteRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectNote } from "@/domain/entities/ProjectNote";

export interface CreateNoteInput {
  actor: Actor;
  projectId: string;
  content: string;
}

export class CreateNote {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly memberRepo: ProjectMemberRepository,
    private readonly noteRepo: NoteRepository
  ) {}

  async execute(input: CreateNoteInput): Promise<ProjectNote> {
    if (!input.content.trim()) {
      throw new ValidationError("El contenido es obligatorio.");
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

    return this.noteRepo.create({
      projectId: input.projectId,
      authorId: input.actor.userId,
      content: input.content.trim(),
    });
  }
}
