/**
 * Однократно после миграции ProfileStarRating: пересчитать ratingAverage / ratingCount
 * у всех профилей, у кого есть одобренные отзывы из чатов или оценки с профиля.
 *
 * Запуск: npx tsx src/scripts/backfill-profile-ratings.ts
 */
import { prisma } from "@/lib/db";
import { backfillAllProfileRatingAggregates } from "@/server/services/profile-star-rating.service";

async function main() {
  await backfillAllProfileRatingAggregates();
  console.log("Готово: агрегаты рейтинга пересчитаны.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
