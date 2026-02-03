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
      throw new ValidationError("Nothing to update.");
    }

    const note = await this.noteRepo.findById(input.noteId);
    if (!note) {
      throw new NotFoundError("Note not found.");
    }

    if (input.actor.role !== "ADMIN" && note.authorId !== input.actor.userId) {
      throw new ForbiddenError("Only the author can update this note.");
    }

    return this.noteRepo.update(input.noteId, {
      title: input.title?.trim(),
      content: input.content?.trim(),
    });
  }
}
