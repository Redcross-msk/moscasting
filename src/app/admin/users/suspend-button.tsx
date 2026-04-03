"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendUserAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function SuspendUserButton({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant={suspended ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await suspendUserAction(userId, !suspended);
          router.refresh();
        });
      }}
    >
      {suspended ? "Разблокировать" : "Заблокировать"}
    </Button>
  );
}
