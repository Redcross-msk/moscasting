import { notFound } from "next/navigation";
import { getChatForAdmin } from "@/server/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminChatInspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatForAdmin(id);
  if (!chat) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Просмотр чата</h1>
        <p className="text-sm text-muted-foreground">
          Кастинг: {chat.application.casting.title} (id: {chat.application.casting.id})
        </p>
      </div>
      <Card>
        <CardContent className="space-y-3 py-4">
          {chat.messages.map((m) => (
            <div key={m.id} className="rounded border p-2 text-sm">
              <p className="text-xs text-muted-foreground">
                {m.sender.email} · {m.sender.role} · {m.createdAt.toISOString()}
              </p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
