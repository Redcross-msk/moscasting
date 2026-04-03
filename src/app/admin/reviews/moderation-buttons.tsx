"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveReviewAction, hideReviewAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await approveReviewAction(reviewId);
            router.refresh();
          });
        }}
      >
        Одобрить
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await hideReviewAction(reviewId);
            router.refresh();
          });
        }}
      >
        Скрыть
      </Button>
    </div>
  );
}
