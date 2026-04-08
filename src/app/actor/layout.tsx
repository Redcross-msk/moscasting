import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ActorWorkspaceChrome } from "@/components/actor-workspace-chrome";
import { redirectIfUserSuspended } from "@/lib/require-active-user";

function ActorChromeFallback() {
  return <div className="min-h-[100px] animate-pulse rounded-lg bg-muted/30" aria-hidden />;
}

export default async function ActorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    redirect("/");
  }
  await redirectIfUserSuspended(session.user.id);

  return (
    <Suspense fallback={<ActorChromeFallback />}>
      <ActorWorkspaceChrome role={session.user.role}>{children}</ActorWorkspaceChrome>
    </Suspense>
  );
}
