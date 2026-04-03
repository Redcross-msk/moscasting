import { auth } from "@/auth";
import { countUnreadNotifications } from "@/server/services/notification.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ count: 0 });
  }
  const count = await countUnreadNotifications(session.user.id);
  return Response.json({ count });
}
