import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; skill?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const sp = await searchParams;
  const qs = new URLSearchParams();
  qs.set("tab", "actors");
  if (sp.q?.trim()) qs.set("q", sp.q.trim());
  if (sp.skill?.trim()) qs.set("skill", sp.skill.trim());
  redirect(`/explore?${qs.toString()}`);
}
