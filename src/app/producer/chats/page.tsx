import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getProducerChatInboxData } from "@/server/services/chat.service";
import { ProducerChatsInbox } from "@/components/producer-chats-inbox";
import {
  isProducerActorDirectThreadAvailable,
  PRISMA_CLIENT_OUTDATED_HINT,
} from "@/lib/prisma-runtime";

function InboxFallback() {
  return <div className="min-h-[400px] animate-pulse rounded-lg bg-muted/40" aria-hidden />;
}

export default async function ProducerChatsPage() {
  const session = await auth();
  if (!session?.user?.id) return <p>Войдите в систему</p>;

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return <p>Нет профиля</p>;

  const data = await getProducerChatInboxData(profile.id, session.user.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-0 sm:pb-4">
      <Suspense fallback={<InboxFallback />}>
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <ProducerChatsInbox
            items={data.items}
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
