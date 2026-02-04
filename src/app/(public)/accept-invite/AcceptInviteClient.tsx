"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@/presentation/hooks/useSupabaseClient";
import { acceptInviteSchema } from "@/presentation/validation/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "submitting";

export default function AcceptInviteClient() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [sessionReady, setSessionReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const parseHashTokens = () => {
      if (typeof window === "undefined") return null;
      const raw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      if (!raw) return null;
      const params = new URLSearchParams(raw);
      return {
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
      };
    };

    const initializeSession = async () => {
      setError(null);
      try {
        const code = searchParams.get("code");
        const hashTokens = parseHashTokens();
        const accessToken =
          hashTokens?.accessToken ?? searchParams.get("access_token");
        const refreshToken =
          hashTokens?.refreshToken ?? searchParams.get("refresh_token");
        let sessionEstablished = false;

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          sessionEstablished = true;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          sessionEstablished = true;
        } else {
          const existing = await supabase.auth.getUser();
          if (!existing.error && existing.data.user) {
            if (!active) return;
            setEmail(existing.data.user.email ?? null);
            setSessionReady(true);
            setStatus("ready");
            return;
          }
        }

        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
          throw userError ?? new Error("No session available.");
        }

        if (active) {
          setEmail(data.user.email ?? null);
          setSessionReady(true);
          setStatus("ready");
          if (sessionEstablished && typeof window !== "undefined") {
            window.history.replaceState({}, "", "/accept-invite");
          }
        }
      } catch {
        if (!active) return;
        setError("Invitacion invalida o expirada.");
        setSessionReady(false);
        setStatus("ready");
      }
    };

    initializeSession();

    return () => {
      active = false;
    };
  }, [searchParams, supabase]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = acceptInviteSchema.safeParse({
      fullName,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos invalidos.");
      return;
    }

    setStatus("submitting");

    const { data: updated, error: updateError } =
      await supabase.auth.updateUser({
        password: parsed.data.password,
        data: { full_name: parsed.data.fullName },
      });

    if (updateError) {
      setError(updateError.message);
      setStatus("ready");
      return;
    }

    const userId = updated.user?.id;
    if (!userId) {
      setError("No se pudo identificar el usuario.");
      setStatus("ready");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.fullName })
      .eq("id", userId);

    if (profileError) {
      setError(profileError.message);
      setStatus("ready");
      return;
    }

    const response = await fetch("/api/me");
    if (response.ok) {
      const { data } = await response.json();
      if (data?.role === "ADMIN") {
        router.push("/admin");
        return;
      }
    }
    router.push("/projects");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Completa tu invitacion</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <p className="text-sm text-muted-foreground">
              Verificando invitacion...
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {email ? (
                <p className="text-sm text-muted-foreground">
                  Invitado: {email}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  disabled={!sessionReady || status === "submitting"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={!sessionReady || status === "submitting"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  disabled={!sessionReady || status === "submitting"}
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={!sessionReady || status === "submitting"}
              >
                {status === "submitting" ? "Guardando..." : "Aceptar invitacion"}
              </Button>
              {!sessionReady && error ? (
                <p className="text-xs text-muted-foreground">
                  Puedes volver a{" "}
                  <Link className="text-primary underline" href="/login">
                    iniciar sesion
                  </Link>
                  .
                </p>
              ) : null}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
