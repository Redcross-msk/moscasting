import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getChatWithAccess } from "@/server/services/chat.service";
import { ChatMessageContent } from "@/components/chat-message-content";
import { ChatComposerUnified } from "@/components/chat-composer-unified";
import { ProducerApplicationChatToolbar } from "@/components/producer-application-chat-toolbar";
import { ChatReviewSection } from "@/components/chat-review-section";

export default async function ProducerChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  const { chatId } = await params;
  const chat = await getChatWithAccess(chatId, session!.user.id);
  if (!chat) notFound();

  const app = chat.application;
  const isProducer = app.producerProfile.userId === session!.user.id;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">{app.casting.title}</h1>
        <p className="text-sm text-muted-foreground">
          {app.actorProfile.fullName} · чат по отклику
        </p>
      </div>

      {isProducer ? (
        <ProducerApplicationChatToolbar applicationId={app.id} status={app.status} />
      ) : null}

      <ChatReviewSection
        applicationId={app.id}
        applicationStatus={app.status}
        reviews={app.reviews}
        viewerUserId={session!.user.id}
        role="PRODUCER"
      />

      <div className="min-h-[240px] space-y-2 rounded-xl border border-border bg-card p-2 shadow-sm sm:min-h-[280px] sm:space-y-3 sm:p-3">
        {chat.messages.map((m) => (
          <div
            key={m.id}
            className={
              m.senderId === session!.user.id
                ? "ml-auto max-w-[min(100%,20rem)] rounded-2xl bg-primary px-2.5 py-2 text-sm text-primary-foreground sm:max-w-[85%] sm:px-3"
                : "mr-auto max-w-[min(100%,20rem)] rounded-2xl bg-muted px-2.5 py-2 text-sm sm:max-w-[85%] sm:px-3"
            }
          >
            <p className="text-[10px] opacity-70 sm:text-xs">{m.sender.email}</p>
            <ChatMessageContent body={m.body} payload={m.payload} />
          </div>
        ))}
      </div>

      <ChatComposerUnified chatId={chatId} disabled={!!chat.closedAt} />
    </div>
  );
}
