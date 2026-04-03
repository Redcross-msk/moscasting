import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProducerWorkspaceChrome } from "@/components/producer-workspace-chrome";

export default async function ProducerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    redirect("/");
  }

  return <ProducerWorkspaceChrome role={session.user.role}>{children}</ProducerWorkspaceChrome>;
}
