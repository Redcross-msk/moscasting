"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить пользователя и все связанные данные безвозвратно?")) return;
        start(async () => {
          await deleteUserAction(userId);
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}
