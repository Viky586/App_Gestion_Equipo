import { User } from "@/domain/entities/User";
import { Role } from "@/domain/value-objects/Role";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  listUsers(): Promise<User[]>;
  findByIds(ids: string[]): Promise<User[]>;
  updateRole(id: string, role: Role): Promise<void>;
}
