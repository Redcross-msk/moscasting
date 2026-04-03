"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { ReportTargetType } from "@prisma/client";
import { fileReportAction } from "@/features/reports/user-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReportCastingButton({
  castingId,
  compactLabel,
  className,
}: {
  castingId: string;
  /** Короткая подпись в шапке страницы */
  compactLabel?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <p className="text-sm text-muted-foreground">Жалоба отправлена</p>;

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size={compactLabel ? "default" : "sm"}
        className={cn(compactLabel && "h-11 w-full text-base", className)}
        onClick={() => setOpen(true)}
      >
        {compactLabel ? "Пожаловаться" : "Пожаловаться на кастинг"}
      </Button>
    );
  }

  return (
    <div className="max-w-md space-y-2 rounded-lg border border-destructive/30 p-4">
      <Textarea placeholder="Опишите причину" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || text.length < 5}
          onClick={() => {
            start(async () => {
              await fileReportAction({
                targetType: ReportTargetType.CASTING,
                targetId: castingId,
                reason: text,
              });
              setDone(true);
            });
          }}
        >
          Отправить
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => setOpen(false)}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
