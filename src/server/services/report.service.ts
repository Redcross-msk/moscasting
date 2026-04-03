import { ReportStatus, ReportTargetType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createReport(params: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  messageId?: string | null;
}) {
  return prisma.report.create({
    data: {
      reporterId: params.reporterId,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      messageId: params.messageId ?? undefined,
    },
  });
}

export async function listReports() {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, email: true } },
    },
  });
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string,
) {
  return prisma.report.update({
    where: { id: reportId },
    data: { status, adminNotes: adminNotes ?? undefined },
  });
}
