import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getChatWithAccess } from "@/server/services/chat.service";
import { ChatMessageContent } from "@/components/chat-message-content";
import { ChatComposerUnified } from "@/components/chat-composer-unified";
import { ChatReviewSection } from "@/components/chat-review-section";
import { ChatThreadMessageBubble } from "@/components/chat-thread-message-bubble";
import { applicationChatMessageReceipt } from "@/lib/chat-message-receipt";
import { chatSenderPublicLabel, formatChatMessageTimeHm } from "@/lib/chat-sender-display";
import { formatActorSurnameAndFirstName } from "@/lib/utils";

export default async function ActorChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  const { chatId } = await params;
  const chat = await getChatWithAccess(chatId, session!.user.id, { markRead: true });
  if (!chat) notFound();

  const app = chat.application;
  const counterpartyUserId =
    app.actorProfile.userId === session!.user.id ? app.producerProfile.userId : app.actorProfile.userId;

  const producerLine =
    app.producerProfile.companyName?.trim() ||
    formatActorSurnameAndFirstName(app.producerProfile.fullName);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pb-0 sm:pb-2">
      <div className="shrink-0">
        <h1 className="text-xl font-bold">{app.casting.title}</h1>
        <p className="text-sm text-muted-foreground">{producerLine} · отклик</p>
      </div>

      <ChatReviewSection
        applicationId={app.id}
        applicationStatus={app.status}
        reviews={app.reviews}
        viewerUserId={session!.user.id}
        role="ACTOR"
      />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain rounded-xl border border-border bg-card p-2 shadow-sm sm:p-3">
        {chat.messages.map((m) => {
          const isMine = m.senderId === session!.user.id;
          const receipt = applicationChatMessageReceipt({
            isMine,
            viewerUserId: session!.user.id,
            counterpartyUserId,
            reads: m.reads,
          });
          return (
            <ChatThreadMessageBubble
              key={m.id}
              isMine={isMine}
              senderLabel={chatSenderPublicLabel(m.sender)}
              timeHm={formatChatMessageTimeHm(m.createdAt)}
              createdAtIso={m.createdAt.toISOString()}
              receipt={receipt}
            >
              <ChatMessageContent body={m.body} payload={m.payload} />
            </ChatThreadMessageBubble>
          );
        })}
      </div>

      <div className="shrink-0">
        <ChatComposerUnified chatId={chatId} disabled={!!chat.closedAt} />
      </div>
    </div>
  );
}
