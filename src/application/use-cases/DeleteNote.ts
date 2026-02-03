import { Actor } from "@/application/dto/Actor";
import { NoteRepository } from "@/application/interfaces/NoteRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface DeleteNoteInput {
  actor: Actor;
  noteId: string;
}

export class DeleteNote {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(input: DeleteNoteInput): Promise<void> {
    const note = await this.noteRepo.findById(input.noteId);
    if (!note) {
      throw new NotFoundError("Note not found.");
    }
    if (input.actor.role !== "ADMIN" && note.authorId !== input.actor.userId) {
      throw new ForbiddenError("Only the author can delete this note.");
    }
    await this.noteRepo.delete(input.noteId);
  }
}
