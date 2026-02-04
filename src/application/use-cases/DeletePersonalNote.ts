import { Actor } from "@/application/dto/Actor";
import { PersonalNoteRepository } from "@/application/interfaces/PersonalNoteRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface DeletePersonalNoteInput {
  actor: Actor;
  noteId: string;
}

export class DeletePersonalNote {
  constructor(private readonly noteRepo: PersonalNoteRepository) {}

  async execute(input: DeletePersonalNoteInput): Promise<void> {
    const note = await this.noteRepo.findById(input.noteId);
    if (!note) {
      throw new NotFoundError("Nota no encontrada.");
    }
    if (note.userId !== input.actor.userId) {
      throw new ForbiddenError("Solo el autor puede eliminar esta nota.");
    }
    await this.noteRepo.delete(input.noteId);
  }
}
