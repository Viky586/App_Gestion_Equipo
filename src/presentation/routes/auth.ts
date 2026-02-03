import { SupabaseClient } from "@supabase/supabase-js";
import { Actor } from "@/application/dto/Actor";
import { UserRepository } from "@/application/interfaces/UserRepository";
import { UnauthorizedError } from "@/domain/errors/AppError";

export async function requireActor(
  supabase: SupabaseClient,
  userRepo: UserRepository
): Promise<Actor> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new UnauthorizedError("Session required.");
  }
  const profile = await userRepo.findById(data.user.id);
  if (!profile) {
    throw new UnauthorizedError("User profile not found.");
  }
  return {
    userId: profile.id,
    role: profile.role,
  };
}
