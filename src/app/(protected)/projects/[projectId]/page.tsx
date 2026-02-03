import { requireServerActor } from "@/presentation/routes/guards";
import { ProjectDetail } from "@/presentation/ui/ProjectDetail";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string } | Promise<{ projectId: string }>;
}) {
  await requireServerActor();
  const resolvedParams = await Promise.resolve(params);
  return <ProjectDetail projectId={resolvedParams.projectId} />;
}
