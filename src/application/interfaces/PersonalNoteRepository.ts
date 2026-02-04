import { PersonalNote } from "@/domain/entities/PersonalNote";

export interface PersonalNoteRepository {
  create(data: {
    userId: string;
    content: string;
  }): Promise<PersonalNote>;
  update(
    id: string,
    data: { content?: string }
  ): Promise<PersonalNote>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<PersonalNote | null>;
  listByUser(userId: string): Promise<PersonalNote[]>;
}
