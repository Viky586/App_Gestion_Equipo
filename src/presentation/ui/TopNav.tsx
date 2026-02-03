"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/presentation/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";

export function TopNav({ isAdmin }: { isAdmin: boolean }) {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="border-b bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/projects" className="text-lg font-semibold">
          TeamHub
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground">
            Proyectos
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Cerrar sesión
          </Button>
        </nav>
      </div>
    </header>
  );
}
