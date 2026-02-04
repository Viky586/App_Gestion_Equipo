import { Actor } from "@/application/dto/Actor";
import { AuthAdminService } from "@/application/interfaces/AuthAdminService";
import { UserRepository } from "@/application/interfaces/UserRepository";
import { ForbiddenError, ValidationError } from "@/domain/errors/AppError";
import { Role } from "@/domain/value-objects/Role";

export interface InviteUserInput {
  actor: Actor;
  email: string;
  role: Role;
  redirectTo: string;
}

export class InviteUser {
  constructor(
    private readonly authAdmin: AuthAdminService,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: InviteUserInput): Promise<{ userId: string }> {
    if (input.actor.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can invite users.");
    }
    if (!input.email.trim()) {
      throw new ValidationError("Email is required.");
    }
    if (!input.redirectTo.trim()) {
      throw new ValidationError("Redirect URL is required.");
    }

    const { userId } = await this.authAdmin.inviteUserByEmail({
      email: input.email.trim().toLowerCase(),
      role: input.role,
      redirectTo: input.redirectTo,
    });

    await this.userRepo.updateRole(userId, input.role);

    return { userId };
  }
}
