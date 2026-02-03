import { requireServerActor } from "@/presentation/routes/guards";
import { ProjectsOverview } from "@/presentation/ui/ProjectsOverview";

export default async function ProjectsPage() {
  await requireServerActor();
  return <ProjectsOverview />;
}
