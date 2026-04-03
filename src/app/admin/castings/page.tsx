import Link from "next/link";
import { listAllCastings } from "@/server/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlockCastingButton } from "./block-button";

export default async function AdminCastingsPage() {
  const castings = await listAllCastings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Кастинги</h1>
      <div className="space-y-2">
        {castings.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
              <div>
                <Link href={`/castings/${c.id}`} className="font-medium hover:underline">
                  {c.title}
                </Link>
                <p className="text-muted-foreground">
                  {c.producerProfile.companyName} · {c.city.name}
                </p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">{c.status}</Badge>
                  <Badge variant="secondary">{c.moderationStatus}</Badge>
                </div>
              </div>
              <BlockCastingButton
                castingId={c.id}
                blocked={c.status === "BLOCKED" || c.moderationStatus === "BLOCKED"}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
