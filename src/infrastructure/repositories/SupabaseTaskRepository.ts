import { SupabaseClient } from "@supabase/supabase-js";
import { TaskRepository } from "@/application/interfaces/TaskRepository";
import { mapTask } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";
import { TaskStatus } from "@/domain/entities/ProjectTask";

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(data: {
    projectId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    assignedTo: string;
    createdBy: string;
  }) {
    const { data: row, error } = await this.client
      .from("project_tasks")
      .insert({
        project_id: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status,
        assigned_to: data.assignedTo,
        created_by: data.createdBy,
      })
      .select("*")
      .single();
    assertSupabase(error, "Failed to create task");
    return mapTask(row);
  }

  async findById(id: string) {
    const { data: row, error } = await this.client
      .from("project_tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch task");
    return row ? mapTask(row) : null;
  }

  async listByProject(projectId: string) {
    const { data, error } = await this.client
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    assertSupabase(error, "Failed to list tasks");
    return (data ?? []).map(mapTask);
  }

  async updateStatus(id: string, status: TaskStatus) {
    const { data: row, error } = await this.client
      .from("project_tasks")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();
    assertSupabase(error, "Failed to update task");
    return mapTask(row);
  }

  async updateAssignee(id: string, assignedTo: string) {
    const { data: row, error } = await this.client
      .from("project_tasks")
      .update({ assigned_to: assignedTo })
      .eq("id", id)
      .select("*")
      .single();
    assertSupabase(error, "Failed to update task assignee");
    return mapTask(row);
  }

  async updateArchive(id: string, isArchived: boolean) {
    const { data: row, error } = await this.client
      .from("project_tasks")
      .update({
        is_archived: isArchived,
        archived_at: isArchived ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select("*")
      .single();
    assertSupabase(error, "Failed to update task archive");
    return mapTask(row);
  }

  async delete(id: string) {
    const { error } = await this.client
      .from("project_tasks")
      .delete()
      .eq("id", id);
    assertSupabase(error, "Failed to delete task");
  }
}
