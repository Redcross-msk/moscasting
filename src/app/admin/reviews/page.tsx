import { listPendingReviews } from "@/server/services/review.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewModerationButtons } from "./moderation-buttons";

export default async function AdminReviewsPage() {
  const reviews = await listPendingReviews();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Отзывы на модерации</h1>
      <p className="text-sm text-muted-foreground">
        Новые отзывы публикуются сразу и учитываются в рейтинге. Здесь остаются старые записи в статусе PENDING (если
        есть) и ручная модерация при необходимости.
      </p>
      <div className="space-y-2">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">Нет отзывов в статусе PENDING</p>
        ) : (
          reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 py-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge>{r.stars}★</Badge>
                  <Badge variant="outline">{r.direction}</Badge>
                </div>
                <p>Автор: {r.author.email}</p>
                <p>Кастинг: {r.application.casting.title}</p>
                <p className="whitespace-pre-wrap">{r.text}</p>
                <ReviewModerationButtons reviewId={r.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
