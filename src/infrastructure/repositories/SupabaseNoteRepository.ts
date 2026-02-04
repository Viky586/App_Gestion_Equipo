import { SupabaseClient } from "@supabase/supabase-js";
import { NoteRepository } from "@/application/interfaces/NoteRepository";
import { mapNote } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabaseNoteRepository implements NoteRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: {
    projectId: string;
    authorId: string;
    content: string;
  }) {
    const { data: row, error } = await this.client
      .from("project_notes")
      .insert({
        project_id: data.projectId,
        author_id: data.authorId,
        content: data.content,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to create note");
    return mapNote(row);
  }

  async update(id: string, data: { content?: string }) {
    const { data: row, error } = await this.client
      .from("project_notes")
      .update({
        ...(data.content ? { content: data.content } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    assertSupabase(error, "Failed to update note");
    return mapNote(row);
  }

  async delete(id: string) {
    const { error } = await this.client
      .from("project_notes")
      .delete()
      .eq("id", id);
    assertSupabase(error, "Failed to delete note");
  }

  async findById(id: string) {
    const { data: row, error } = await this.client
      .from("project_notes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch note");
    return row ? mapNote(row) : null;
  }

  async listByProject(projectId: string) {
    const { data, error } = await this.client
      .from("project_notes")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    assertSupabase(error, "Failed to list notes");
    return (data ?? []).map(mapNote);
  }
}
