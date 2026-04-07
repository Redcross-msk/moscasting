"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteCastingAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function AdminDeleteCastingButton({ castingId }: { castingId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить кастинг с портала? Данные будут помечены как удалённые.")) return;
        start(async () => {
          await adminDeleteCastingAction(castingId);
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}
