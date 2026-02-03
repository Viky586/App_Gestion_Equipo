import { SupabaseClient } from "@supabase/supabase-js";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { mapProject } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: {
    name: string;
    description: string | null;
    createdBy: string;
  }) {
    const { data: row, error } = await this.client
      .from("projects")
      .insert({
        name: data.name,
        description: data.description,
        created_by: data.createdBy,
      })
      .select("*")
      .single();

    assertSupabase(error, "Failed to create project");
    return mapProject(row);
  }

  async findById(id: string) {
    const { data: row, error } = await this.client
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch project");
    return row ? mapProject(row) : null;
  }

  async listForUser(_userId: string) {
    void _userId;
    const { data: rows, error } = await this.client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    assertSupabase(error, "Failed to list projects");
    return (rows ?? []).map(mapProject);
  }

  async update(id: string, data: { name?: string; description?: string | null }) {
    const { data: row, error } = await this.client
      .from("projects")
      .update({
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();

    assertSupabase(error, "Failed to update project");
    return mapProject(row);
  }

  async delete(id: string) {
    const { error } = await this.client.from("projects").delete().eq("id", id);
    assertSupabase(error, "Failed to delete project");
  }
}
