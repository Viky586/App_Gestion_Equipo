import { uuidParamSchema } from "@/presentation/validation/schemas";

export async function getUuidParam(
  params: unknown,
  key: string
): Promise<string> {
  const resolved = await Promise.resolve(params as Record<string, unknown>);
  return uuidParamSchema.parse(resolved?.[key]);
}
