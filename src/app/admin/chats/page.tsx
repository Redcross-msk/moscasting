import Link from "next/link";
import { listChatsForAdmin } from "@/server/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminChatsPage() {
  const chats = await listChatsForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Чаты (инспекция)</h1>
      <div className="space-y-2">
        {chats.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4 text-sm">
              <Link href={`/admin/chats/${c.id}`} className="font-medium text-primary hover:underline">
                Чат {c.id.slice(0, 8)}…
              </Link>
              <p className="text-muted-foreground">
                Кастинг: {c.application.casting.title} · Актёр: {c.application.actorProfile.fullName} · Продюсер:{" "}
                {c.application.producerProfile.companyName}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
