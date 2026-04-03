"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockActorProfileAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function BlockActorButton({ profileId, blocked }: { profileId: string; blocked: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant={blocked ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await blockActorProfileAction(profileId, !blocked);
          router.refresh();
        });
      }}
    >
      {blocked ? "Снять блок" : "Заблокировать"}
    </Button>
  );
}
