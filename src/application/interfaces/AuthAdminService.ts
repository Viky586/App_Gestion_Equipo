import { Role } from "@/domain/value-objects/Role";

export interface AuthAdminService {
  createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
  }): Promise<{ userId: string }>;
  inviteUserByEmail(data: {
    email: string;
    role: Role;
    redirectTo: string;
  }): Promise<{ userId: string }>;
}
