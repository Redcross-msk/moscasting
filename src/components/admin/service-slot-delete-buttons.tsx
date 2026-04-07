"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  adminDeleteCourseSlotAction,
  adminDeletePortfolioDayAction,
} from "@/features/admin/service-leads-actions";

export function CourseSlotDeleteButton({ slotId }: { slotId: string }) {
  const [p, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={p}
      onClick={() => {
        if (!confirm("Удалить слот и связанные заявки?")) return;
        start(async () => {
          await adminDeleteCourseSlotAction(slotId);
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}

export function PortfolioDayDeleteButton({ dayId }: { dayId: string }) {
  const [p, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={p}
      onClick={() => {
        if (!confirm("Удалить день и связанные заявки?")) return;
        start(async () => {
          await adminDeletePortfolioDayAction(dayId);
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}
