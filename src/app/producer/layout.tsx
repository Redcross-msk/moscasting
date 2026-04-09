import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProducerWorkspaceChrome } from "@/components/producer-workspace-chrome";
import { redirectIfUserSuspended } from "@/lib/require-active-user";

function ProducerChromeFallback() {
  return <div className="min-h-[100px] animate-pulse rounded-lg bg-muted/30" aria-hidden />;
}

export default async function ProducerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    redirect("/");
  }
  await redirectIfUserSuspended(session.user.id);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <Suspense fallback={<ProducerChromeFallback />}>
        <ProducerWorkspaceChrome role={session.user.role}>{children}</ProducerWorkspaceChrome>
      </Suspense>
    </div>
  );
}
