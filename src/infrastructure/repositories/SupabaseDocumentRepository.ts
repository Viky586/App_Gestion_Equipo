import { SupabaseClient } from "@supabase/supabase-js";
import { DocumentRepository } from "@/application/interfaces/DocumentRepository";
import { mapDocument } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: {
    projectId: string;
    authorId: string;
    storagePath: string;
    originalName: string;
    description: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    const { data: row, error } = await this.client
      .from("project_documents")
      .insert({
        project_id: data.projectId,
        author_id: data.authorId,
        storage_path: data.storagePath,
        original_name: data.originalName,
        description: data.description,
        mime_type: data.mimeType,
        size_bytes: data.sizeBytes,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to create document");
    return mapDocument(row);
  }

  async findById(id: string) {
    const { data: row, error } = await this.client
      .from("project_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch document");
    return row ? mapDocument(row) : null;
  }

  async delete(id: string) {
    const { error } = await this.client
      .from("project_documents")
      .delete()
      .eq("id", id);
    assertSupabase(error, "Failed to delete document");
  }

  async listByProject(projectId: string) {
    const { data, error } = await this.client
      .from("project_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    assertSupabase(error, "Failed to list documents");
    return (data ?? []).map(mapDocument);
  }
}
