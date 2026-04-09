import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPublicProducerProfile } from "@/server/services/producer-profile.service";
import { attachPortfolioLikesToPhotos } from "@/server/media/portfolio-photo-likes";
import { ProducerProfileView } from "@/components/producer-profile-view";

export default async function ProducerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicProducerProfile(id);
  if (!data) notFound();

  const session = await auth();
  const mediaWithLikes = await attachPortfolioLikesToPhotos(data.media, session?.user?.id);

  const completed = data.completedCastingsPublic ?? [];

  let ratingInteractive: { subjectUserId: string; initialStars: number | null } | undefined;
  const subjectUserId = data.user.id;
  if (session?.user?.id && session.user.id !== subjectUserId) {
    const row = await prisma.profileStarRating.findUnique({
      where: {
        authorId_subjectUserId: { authorId: session.user.id, subjectUserId },
      },
      select: { stars: true },
    });
    ratingInteractive = { subjectUserId, initialStars: row?.stars ?? null };
  }

  return (
    <ProducerProfileView
      variant="public"
      castingLinkPrefix="/castings"
      canLikePortfolioPhotos={Boolean(session?.user?.id)}
      ratingInteractive={ratingInteractive}
      profile={{
        companyName: data.companyName,
        fullName: data.fullName,
        positionTitle: data.positionTitle,
        filmography: data.filmography,
        ratingAverage: data.ratingAverage,
        ratingCount: data.ratingCount,
      }}
      media={mediaWithLikes.map((m) => ({
        id: m.id,
        publicUrl: m.publicUrl,
        storageKey: m.storageKey,
        isAvatar: m.isAvatar,
        likeCount: m.likeCount,
        likedByMe: m.likedByMe,
      }))}
      filmographyEntries={data.filmographyEntries.map((e) => ({
        id: e.id,
        title: e.title,
        releaseDate: e.releaseDate,
        kinopoiskUrl: e.kinopoiskUrl,
        posterPublicUrl: e.posterPublicUrl,
      }))}
      reviews={data.reviewsAbout.map((r) => ({
        id: r.id,
        stars: r.stars,
        text: r.text,
        authorLabel: r.author.actorProfile?.fullName ?? r.author.email ?? "Актёр",
        createdAt: r.createdAt,
      }))}
      castings={data.castings.map((c) => ({
        id: c.id,
        title: c.title,
        city: c.city,
      }))}
      completedCastings={completed.map((c) => ({
        id: c.id,
        title: c.title,
        city: c.city,
      }))}
    />
  );
}
