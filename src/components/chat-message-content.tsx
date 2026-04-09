import { ActorProfileSnapshotCard } from "@/components/actor-profile-snapshot-card";
import { CastingInviteMessageCard } from "@/components/casting-invite-message-card";
import {
  parseActorProfilePayload,
  parseCastingInviteDetailsPayload,
  parseChatAttachmentPayload,
} from "@/lib/message-payload";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

export function ChatMessageContent({ body, payload }: { body: string; payload: unknown | null | undefined }) {
  const actorCard = parseActorProfilePayload(payload);
  const invite = parseCastingInviteDetailsPayload(payload);
  const attach = parseChatAttachmentPayload(payload);

  return (
    <div className="space-y-2">
      {actorCard ? <ActorProfileSnapshotCard data={actorCard} /> : null}
      {invite ? <CastingInviteMessageCard data={invite} /> : null}
      {attach ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          {attach.attachmentKind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveUploadedMediaSrc(attach.url, null) ?? attach.url}
              alt=""
              className="max-h-64 w-full object-contain"
            />
          ) : attach.attachmentKind === "video" ? (
            <video
              src={resolveUploadedMediaSrc(attach.url, null) ?? attach.url}
              controls
              className="max-h-64 w-full"
              playsInline
            />
          ) : null}
          <a
            href={resolveUploadedMediaSrc(attach.url, null) ?? attach.url}
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
