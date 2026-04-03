import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addProducerProfileMediaAction,
  moveProducerMediaAction,
  setProducerAvatarMediaFormAction,
} from "@/features/media/actions";

type MediaRow = {
  id: string;
  publicUrl: string | null;
  isAvatar: boolean;
  sortOrder: number;
};

export function ProducerProfileMediaEditor({ media }: { media: MediaRow[] }) {
  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Фото профиля</CardTitle>
        <p className="text-sm text-muted-foreground">До 5 изображений. Первое в списке можно сделать логотипом.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={addProducerProfileMediaAction}>
          <Button type="submit" size="sm" variant="secondary">
            + Фото
          </Button>
        </form>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">Добавьте фото кнопкой выше.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((m, index) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {m.publicUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.publicUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="text-sm">
                    {m.isAvatar ? <Badge>Аватар</Badge> : null}
                    <p className="mt-1 text-xs text-muted-foreground">Порядок: {index + 1}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={moveProducerMediaAction} className="inline">
                    <input type="hidden" name="mediaId" value={m.id} />
                    <input type="hidden" name="direction" value="up" />
                    <Button type="submit" size="sm" variant="outline" disabled={index === 0}>
                      ↑
                    </Button>
                  </form>
                  <form action={moveProducerMediaAction} className="inline">
                    <input type="hidden" name="mediaId" value={m.id} />
                    <input type="hidden" name="direction" value="down" />
                    <Button type="submit" size="sm" variant="outline" disabled={index === sorted.length - 1}>
                      ↓
                    </Button>
                  </form>
                  {!m.isAvatar ? (
                    <form action={setProducerAvatarMediaFormAction} className="inline">
                      <input type="hidden" name="mediaId" value={m.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Сделать аватаром
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
