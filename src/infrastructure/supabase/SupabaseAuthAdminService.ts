import { SupabaseClient } from "@supabase/supabase-js";
import { AuthAdminService } from "@/application/interfaces/AuthAdminService";
import { Role } from "@/domain/value-objects/Role";

export class SupabaseAuthAdminService implements AuthAdminService {
  constructor(private readonly client: SupabaseClient) {}

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
  }) {
    void data.role;
    const { data: result, error } = await this.client.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
      },
    });
    if (error || !result.user) {
      throw new Error(`Failed to create user: ${error?.message ?? ""}`);
    }
    return { userId: result.user.id };
  }
}
