import { Actor } from "@/application/dto/Actor";
import { PersonalNoteRepository } from "@/application/interfaces/PersonalNoteRepository";
import { ValidationError } from "@/domain/errors/AppError";
import { PersonalNote } from "@/domain/entities/PersonalNote";

export interface CreatePersonalNoteInput {
  actor: Actor;
  title: string;
  content: string;
}

export class CreatePersonalNote {
  constructor(private readonly noteRepo: PersonalNoteRepository) {}

  async execute(input: CreatePersonalNoteInput): Promise<PersonalNote> {
    if (!input.title.trim()) {
      throw new ValidationError("El titulo es obligatorio.");
    }
    if (!input.content.trim()) {
      throw new ValidationError("El contenido es obligatorio.");
    }
    return this.noteRepo.create({
      userId: input.actor.userId,
      title: input.title.trim(),
      content: input.content.trim(),
    });
  }
}
