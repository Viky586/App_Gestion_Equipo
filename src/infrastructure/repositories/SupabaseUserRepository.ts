import { SupabaseClient } from "@supabase/supabase-js";
import { UserRepository } from "@/application/interfaces/UserRepository";
import { mapUser } from "@/infrastructure/repositories/mappers";
import { assertSupabase } from "@/infrastructure/repositories/supabaseUtils";
import { Role } from "@/domain/value-objects/Role";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string) {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch user");
    return data ? mapUser(data) : null;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    assertSupabase(error, "Failed to fetch user by email");
    return data ? mapUser(data) : null;
  }

  async listCollaborators() {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("role", "COLLAB")
      .order("created_at", { ascending: false });
    assertSupabase(error, "Failed to list collaborators");
    return (data ?? []).map(mapUser);
  }

  async updateRole(id: string, role: Role) {
    const { error } = await this.client
      .from("profiles")
      .update({ role })
      .eq("id", id);
    assertSupabase(error, "Failed to update user role");
  }
}
