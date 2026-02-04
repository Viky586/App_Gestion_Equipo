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
      throw new NotFoundError("Nota no encontrada.");
    }
    if (note.authorId !== input.actor.userId && !input.actor.isPrimaryAdmin) {
      throw new ForbiddenError("Solo el autor puede eliminar esta nota.");
    }
    await this.noteRepo.delete(input.noteId);
  }
}
