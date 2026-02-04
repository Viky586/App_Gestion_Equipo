import { Actor } from "@/application/dto/Actor";
import { PersonalNoteRepository } from "@/application/interfaces/PersonalNoteRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { PersonalNote } from "@/domain/entities/PersonalNote";

export interface UpdatePersonalNoteInput {
  actor: Actor;
  noteId: string;
  title?: string;
  content?: string;
}

export class UpdatePersonalNote {
  constructor(private readonly noteRepo: PersonalNoteRepository) {}

  async execute(input: UpdatePersonalNoteInput): Promise<PersonalNote> {
    if (!input.title && !input.content) {
      throw new ValidationError("No hay cambios para actualizar.");
    }
    const note = await this.noteRepo.findById(input.noteId);
    if (!note) {
      throw new NotFoundError("Nota no encontrada.");
    }
    if (note.userId !== input.actor.userId) {
      throw new ForbiddenError("Solo el autor puede actualizar esta nota.");
    }
    return this.noteRepo.update(input.noteId, {
      title: input.title?.trim(),
      content: input.content?.trim(),
    });
  }
}
