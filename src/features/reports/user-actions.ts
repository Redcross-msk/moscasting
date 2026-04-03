"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ReportTargetType } from "@prisma/client";
import { createReport } from "@/server/services/report.service";

export async function fileReportAction(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  messageId?: string | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Войдите, чтобы отправить жалобу");

  await createReport({
    reporterId: session.user.id,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason.trim(),
    messageId: input.messageId,
  });

  revalidatePath("/");
}
