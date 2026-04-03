"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { acceptToProjectAction, rejectApplicationAction } from "@/features/applications/actions";
import { Button } from "@/components/ui/button";

export function ProducerApplicationChatToolbar({
  applicationId,
  status,
  onDone,
}: {
  applicationId: string;
  status: ApplicationStatus;
  onDone?: () => void;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const canDecide =
    status !== ApplicationStatus.REJECTED &&
    status !== ApplicationStatus.WITHDRAWN &&
    status !== ApplicationStatus.INVITED &&
    status !== ApplicationStatus.CAST_PASSED;

  if (!canDecide) return null;

  return (
    <div className="max-w-full rounded-lg border border-primary/20 bg-primary/5 p-2.5 sm:rounded-xl sm:p-3">
      <p className="mb-1.5 text-[10px] font-medium text-muted-foreground sm:mb-2 sm:text-xs">
        Решение по отклику
      </p>
      <div className="flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">
        <Button
          size="sm"
          className="h-8 shrink-0 text-xs sm:h-9 sm:text-sm"
          disabled={pending}
          onClick={() => {
            start(async () => {
              await acceptToProjectAction(applicationId);
              onDone?.();
              router.refresh();
            });
          }}
        >
          Принять в проект
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0 text-xs sm:h-9 sm:text-sm"
          disabled={pending}
          onClick={() => {
            if (!confirm("Отказать актёру? Чат будет закрыт, отправится сообщение с объяснением.")) return;
            start(async () => {
              await rejectApplicationAction(applicationId);
              onDone?.();
              router.refresh();
            });
          }}
        >
          Отказать
        </Button>
      </div>
    </div>
  );
}
