"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockCastingAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function BlockCastingButton({ castingId, blocked }: { castingId: string; blocked: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant={blocked ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await blockCastingAction(castingId, !blocked);
          router.refresh();
        });
      }}
    >
      {blocked ? "Разблокировать" : "Блок"}
    </Button>
  );
}
