import { ReactNode } from "react";
import { requireServerActor } from "@/presentation/routes/guards";
import { TopNav } from "@/presentation/ui/TopNav";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await requireServerActor();
  return (
    <div className="min-h-screen bg-muted/30">
      <TopNav isAdmin={actor.role === "ADMIN"} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
