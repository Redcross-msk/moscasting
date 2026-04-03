"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withdrawApplicationAction } from "@/features/applications/actions";
import { Button } from "@/components/ui/button";

export function WithdrawButton({
  applicationId,
  className,
}: {
  applicationId: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await withdrawApplicationAction(applicationId);
          router.refresh();
        });
      }}
    >
      Отозвать отклик
    </Button>
  );
}
