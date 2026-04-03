import { listReports } from "@/server/services/report.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "./report-actions";

export default async function AdminReportsPage() {
  const reports = await listReports();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Жалобы</h1>
      <div className="space-y-2">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 py-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{r.status}</Badge>
                <Badge variant="outline">{r.targetType}</Badge>
              </div>
              <p>От: {r.reporter.email}</p>
              <p>Цель ID: {r.targetId}</p>
              <p className="whitespace-pre-wrap">{r.reason}</p>
              <ReportActions reportId={r.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
