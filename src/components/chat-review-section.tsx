import type { Review } from "@prisma/client";
import { ApplicationStatus, ReviewDirection } from "@prisma/client";
import { ReviewBlock } from "@/components/review-block";

export function ChatReviewSection({
  applicationId,
  applicationStatus,
  reviews,
  viewerUserId,
  role,
}: {
  applicationId: string;
  applicationStatus: ApplicationStatus;
  reviews: Review[];
  viewerUserId: string;
  role: "ACTOR" | "PRODUCER";
}) {
  const canActorReview =
    applicationStatus === ApplicationStatus.INVITED || applicationStatus === ApplicationStatus.CAST_PASSED;

  if (role === "ACTOR" && canActorReview) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Оценка</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Поставьте звёзды кастинг-директору (без текста). Он не увидит вашу оценку в чате; она учитывается в общем
          рейтинге.
        </p>
        <ReviewBlock
          applicationId={applicationId}
          direction={ReviewDirection.ACTOR_TO_PRODUCER}
          existing={reviews.find(
            (r) => r.direction === ReviewDirection.ACTOR_TO_PRODUCER && r.authorId === viewerUserId,
          )}
        />
      </div>
    );
  }

  if (role === "ACTOR" && applicationStatus !== ApplicationStatus.REJECTED && applicationStatus !== ApplicationStatus.WITHDRAWN) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground sm:text-sm">
        После «Принять в проект» здесь можно будет поставить оценку звёздами — без текста, собеседник не увидит оценку в
        чате.
      </div>
    );
  }

  if (role === "PRODUCER" && canActorReview) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Оценка актёра</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Только звёзды, без текста. Актёр не увидит вашу оценку в чате; она учитывается в рейтинге.
        </p>
        <ReviewBlock
          applicationId={applicationId}
          direction={ReviewDirection.PRODUCER_TO_ACTOR}
          existing={reviews.find(
            (r) => r.direction === ReviewDirection.PRODUCER_TO_ACTOR && r.authorId === viewerUserId,
          )}
        />
      </div>
    );
  }

  return null;
}
