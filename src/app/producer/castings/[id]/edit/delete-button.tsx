"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCastingAction } from "@/features/castings/actions";
import { Button } from "@/components/ui/button";

export function DeleteCastingButton({ castingId }: { castingId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      disabled={pending}
      type="button"
      onClick={() => {
        if (!confirm("Удалить кастинг (архив)?")) return;
        start(async () => {
          await deleteCastingAction(castingId);
          router.push("/producer/castings");
          router.refresh();
        });
      }}
    >
      Удалить кастинг
    </Button>
  );
}
