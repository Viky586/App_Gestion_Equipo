import { SupabaseClient } from "@supabase/supabase-js";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";

export class SupabaseProjectMemberRepository implements ProjectMemberRepository {
  constructor(private readonly client: SupabaseClient) {}

  async addMember(data: {
    projectId: string;
    userId: string;
    assignedBy: string;
  }) {
    const { data: row, error } = await this.client
      .from("project_members")
      .insert({
        project_id: data.projectId,
        user_id: data.userId,
        assigned_by: data.assignedBy,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to add project member");
    return {
      projectId: row.project_id,
      userId: row.user_id,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
    };
  }

  async removeMember(projectId: string, userId: string) {
    const { error } = await this.client
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);
    assertSupabase(error, "Failed to remove project member");
  }

  async isMember(projectId: string, userId: string) {
    const { data, error } = await this.client
      .from("project_members")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    assertSupabase(error, "Failed to check project membership");
    return Boolean(data);
  }

  async listMembers(projectId: string) {
    const { data, error } = await this.client
      .from("project_members")
      .select("*")
      .eq("project_id", projectId);
    assertSupabase(error, "Failed to list project members");
    return (data ?? []).map((row) => ({
      projectId: row.project_id,
      userId: row.user_id,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
    }));
  }
}
