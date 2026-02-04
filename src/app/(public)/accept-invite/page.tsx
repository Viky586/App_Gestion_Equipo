import { Suspense } from "react";
import AcceptInviteClient from "./AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4 text-slate-100">
          Cargando invitacion...
        </div>
      }
    >
      <AcceptInviteClient />
    </Suspense>
  );
}
