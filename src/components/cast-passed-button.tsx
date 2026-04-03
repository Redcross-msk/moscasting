"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCastPassedAction } from "@/features/applications/actions";
import { Button } from "@/components/ui/button";

export function CastPassedButton({ applicationId }: { applicationId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Отметить «Кастинг пройден»? После этого можно оставить взаимные отзывы.")) return;
        start(async () => {
          await markCastPassedAction(applicationId);
          router.refresh();
        });
      }}
    >
      Кастинг пройден
    </Button>
  );
}
