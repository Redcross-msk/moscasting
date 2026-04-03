import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function CastingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const { q } = await searchParams;
  const qs = new URLSearchParams();
  qs.set("tab", "castings");
  if (q?.trim()) qs.set("q", q.trim());
  redirect(`/explore?${qs.toString()}`);
}
