import { notFound } from "next/navigation";
import { getPublicProducerProfile } from "@/server/services/producer-profile.service";
import { ProducerProfileView } from "@/components/producer-profile-view";

export default async function ProducerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicProducerProfile(id);
  if (!data) notFound();

  const completed = data.completedCastingsPublic ?? [];

  return (
    <ProducerProfileView
      variant="public"
      castingLinkPrefix="/castings"
      profile={{
        companyName: data.companyName,
        fullName: data.fullName,
        positionTitle: data.positionTitle,
        filmography: data.filmography,
        ratingAverage: data.ratingAverage,
        ratingCount: data.ratingCount,
      }}
      media={data.media.map((m) => ({
        id: m.id,
        publicUrl: m.publicUrl,
        isAvatar: m.isAvatar,
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
