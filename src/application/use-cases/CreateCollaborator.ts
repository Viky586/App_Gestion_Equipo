import { Actor } from "@/application/dto/Actor";
import { AuthAdminService } from "@/application/interfaces/AuthAdminService";
import { UserRepository } from "@/application/interfaces/UserRepository";
import { ForbiddenError, ValidationError } from "@/domain/errors/AppError";

export interface CreateCollaboratorInput {
  actor: Actor;
  email: string;
  password: string;
  fullName: string;
}

export class CreateCollaborator {
  constructor(
    private readonly authAdmin: AuthAdminService,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: CreateCollaboratorInput): Promise<{ userId: string }> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores pueden crear colaboradores.");
    }
    if (!input.email.trim()) {
      throw new ValidationError("El email es obligatorio.");
    }
    if (!input.password.trim()) {
      throw new ValidationError("La contrasena es obligatoria.");
    }

    const { userId } = await this.authAdmin.createUser({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      fullName: input.fullName.trim(),
      role: "COLLAB",
    });

    await this.userRepo.updateRole(userId, "COLLAB");

    return { userId };
  }
}
