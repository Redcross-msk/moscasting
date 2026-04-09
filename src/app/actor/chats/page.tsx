import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActorChatInboxData } from "@/server/services/chat.service";
import { ActorChatsInbox } from "@/components/actor-chats-inbox";
import {
  isProducerActorDirectThreadAvailable,
  PRISMA_CLIENT_OUTDATED_HINT,
} from "@/lib/prisma-runtime";

function InboxFallback() {
  return <div className="min-h-[400px] animate-pulse rounded-lg bg-muted/40" aria-hidden />;
}

export default async function ActorChatsPage() {
  const session = await auth();
  if (!session?.user?.id) return <p>Войдите в систему</p>;

  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return <p>Нет профиля</p>;

  const data = await getActorChatInboxData(profile.id, session.user.id);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden pb-0 sm:pb-4">
      <Suspense fallback={<InboxFallback />}>
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <ActorChatsInbox
            byCasting={data.byCasting}
            direct={data.direct}
            currentUserId={session.user.id}
            directChatDisabledMessage={
              isProducerActorDirectThreadAvailable() ? null : PRISMA_CLIENT_OUTDATED_HINT
            }
          />
        </div>
      </Suspense>
    </div>
  );
}
