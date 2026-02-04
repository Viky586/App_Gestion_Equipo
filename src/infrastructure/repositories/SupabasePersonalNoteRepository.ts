import { SupabaseClient } from "@supabase/supabase-js";
import { PersonalNoteRepository } from "@/application/interfaces/PersonalNoteRepository";
import { mapPersonalNote } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabasePersonalNoteRepository implements PersonalNoteRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: { userId: string; title: string; content: string }) {
    const { data: row, error } = await this.client
      .from("personal_notes")
      .insert({
        user_id: data.userId,
        title: data.title,
        content: data.content,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to create personal note");
    return mapPersonalNote(row);
  }

  async update(id: string, data: { title?: string; content?: string }) {
    const { data: row, error } = await this.client
      .from("personal_notes")
      .update({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    assertSupabase(error, "Failed to update personal note");
    return mapPersonalNote(row);
  }

  async delete(id: string) {
    const { error } = await this.client
      .from("personal_notes")
      .delete()
      .eq("id", id);
    assertSupabase(error, "Failed to delete personal note");
  }

  async findById(id: string) {
    const { data: row, error } = await this.client
      .from("personal_notes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch personal note");
    return row ? mapPersonalNote(row) : null;
  }

  async listByUser(userId: string) {
    const { data, error } = await this.client
      .from("personal_notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    assertSupabase(error, "Failed to list personal notes");
    return (data ?? []).map(mapPersonalNote);
  }
}
