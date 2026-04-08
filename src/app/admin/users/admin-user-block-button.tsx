"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  blockActorProfileAction,
  blockProducerProfileAction,
  suspendUserAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

type AdminUserBlockButtonProps = {
  userId: string;
  profileId: string;
  kind: "actor" | "producer";
  suspended: boolean;
  profileBlocked: boolean;
};

/** Одна кнопка: блокирует вход (SUSPENDED) и скрывает профиль в каталоге; снимает оба ограничения. */
export function AdminUserBlockButton({
  userId,
  profileId,
  kind,
  suspended,
  profileBlocked,
}: AdminUserBlockButtonProps) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const fullyBlocked = suspended || profileBlocked;

  return (
    <Button
      size="sm"
      variant={fullyBlocked ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          const block = !fullyBlocked;
          await suspendUserAction(userId, block);
          if (kind === "actor") {
            await blockActorProfileAction(profileId, block);
          } else {
            await blockProducerProfileAction(profileId, block);
          }
          router.refresh();
        });
      }}
    >
      {fullyBlocked ? "Разблокировать" : "Заблокировать"}
    </Button>
  );
}
