"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReportStatus } from "@prisma/client";
import { updateReportAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function setStatus(status: ReportStatus) {
    start(async () => {
      await updateReportAction(reportId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus(ReportStatus.IN_REVIEW)}>
        В работе
      </Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => setStatus(ReportStatus.RESOLVED)}>
        Решено
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus(ReportStatus.DISMISSED)}>
        Отклонить
      </Button>
    </div>
  );
}
