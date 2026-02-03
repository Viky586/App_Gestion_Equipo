import { SupabaseClient } from "@supabase/supabase-js";
import { MessageRepository } from "@/application/interfaces/MessageRepository";
import { mapMessage } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabaseMessageRepository implements MessageRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: {
    projectId: string;
    authorId: string;
    content: string;
  }) {
    const { data: row, error } = await this.client
      .from("project_messages")
      .insert({
        project_id: data.projectId,
        author_id: data.authorId,
        content: data.content,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to create message");
    return mapMessage(row);
  }

  async listByProject(projectId: string) {
    const { data, error } = await this.client
      .from("project_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    assertSupabase(error, "Failed to list messages");
    return (data ?? []).map(mapMessage);
  }
}
