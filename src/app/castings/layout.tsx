import { auth } from "@/auth";
import { redirectIfUserSuspended } from "@/lib/require-active-user";

export default async function CastingsSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.id) {
    await redirectIfUserSuspended(session.user.id);
  }
  return children;
}
