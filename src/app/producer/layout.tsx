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
    <Suspense fallback={<ProducerChromeFallback />}>
      <ProducerWorkspaceChrome role={session.user.role}>{children}</ProducerWorkspaceChrome>
    </Suspense>
  );
}
