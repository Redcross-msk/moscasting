import { ActorProfileSnapshotCard } from "@/components/actor-profile-snapshot-card";
import { CastingInviteMessageCard } from "@/components/casting-invite-message-card";
import {
  parseActorProfilePayload,
  parseCastingInviteDetailsPayload,
  parseChatAttachmentPayload,
} from "@/lib/message-payload";

export function ChatMessageContent({ body, payload }: { body: string; payload: unknown | null | undefined }) {
  const actorCard = parseActorProfilePayload(payload);
  const invite = parseCastingInviteDetailsPayload(payload);
  const attach = parseChatAttachmentPayload(payload);

  return (
    <div className="space-y-2">
      {actorCard ? <ActorProfileSnapshotCard data={actorCard} /> : null}
      {invite ? <CastingInviteMessageCard data={invite} /> : null}
      {attach ? (
        <div className="overflow-hidden rounded-lg border border-border/80 bg-background/50">
          {attach.attachmentKind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attach.url} alt="" className="max-h-64 w-full object-contain" />
          ) : attach.attachmentKind === "video" ? (
            <video src={attach.url} controls className="max-h-64 w-full" playsInline />
          ) : null}
          <a
            href={attach.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2 py-2 text-xs font-medium text-primary hover:underline"
          >
            {attach.fileName} · скачать / открыть
          </a>
        </div>
      ) : null}
      <p className="whitespace-pre-wrap text-sm">{body}</p>
    </div>
  );
}
