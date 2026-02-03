import { Role } from "@/domain/value-objects/Role";

export interface AuthAdminService {
  createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
  }): Promise<{ userId: string }>;
}
