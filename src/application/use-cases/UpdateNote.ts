import { Actor } from "@/application/dto/Actor";
import { NoteRepository } from "@/application/interfaces/NoteRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectNote } from "@/domain/entities/ProjectNote";

export interface UpdateNoteInput {
  actor: Actor;
  noteId: string;
  title?: string;
  content?: string;
}

export class UpdateNote {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<ProjectNote> {
    if (!input.title && !input.content) {
      throw new ValidationError("No hay cambios para actualizar.");
    }

    const note = await this.noteRepo.findById(input.noteId);
    if (!note) {
      throw new NotFoundError("Nota no encontrada.");
    }

    if (note.authorId !== input.actor.userId) {
      throw new ForbiddenError("Solo el autor puede actualizar esta nota.");
    }

    return this.noteRepo.update(input.noteId, {
      title: input.title?.trim(),
      content: input.content?.trim(),
    });
  }
}
