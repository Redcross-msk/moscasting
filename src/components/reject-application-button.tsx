"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rejectApplicationAction } from "@/features/applications/actions";
import { Button } from "@/components/ui/button";

export function RejectApplicationButton({ applicationId }: { applicationId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Отклонить отклик?")) return;
        start(async () => {
          await rejectApplicationAction(applicationId);
          router.refresh();
        });
      }}
    >
      Отклонить
    </Button>
  );
}
