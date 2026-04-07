import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ActorWorkspaceChrome } from "@/components/actor-workspace-chrome";
import { redirectIfUserSuspended } from "@/lib/require-active-user";

export default async function ActorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    redirect("/");
  }
  await redirectIfUserSuspended(session.user.id);

  return <ActorWorkspaceChrome role={session.user.role}>{children}</ActorWorkspaceChrome>;
}
