import { auth } from "@/auth";
import { countUnreadChatConversationsForUser } from "@/server/services/chat.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ count: 0 });
  }
  const count = await countUnreadChatConversationsForUser(session.user.id, session.user.role);
  return Response.json({ count });
}
