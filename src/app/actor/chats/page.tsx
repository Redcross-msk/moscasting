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

  const data = await getActorChatInboxData(profile.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Чаты</h1>
      <Suspense fallback={<InboxFallback />}>
        <ActorChatsInbox
          byCasting={data.byCasting}
          direct={data.direct}
          currentUserId={session.user.id}
          directChatDisabledMessage={
            isProducerActorDirectThreadAvailable() ? null : PRISMA_CLIENT_OUTDATED_HINT
          }
        />
      </Suspense>
    </div>
  );
}
