"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { PortfolioPhotoLightbox, type LightboxPhoto } from "@/components/portfolio-photo-lightbox";
import { VideoWithPosterFrame } from "@/components/video-with-poster-frame";
import { cn } from "@/lib/utils";

export type ProfilePortfolioPhoto = {
  id: string;
  src: string;
  likeCount: number;
  likedByMe: boolean;
};

export type ProfilePortfolioVideo = {
  id: string;
  src: string;
};

type Props = {
  photos: ProfilePortfolioPhoto[];
  videos: ProfilePortfolioVideo[];
  canLike: boolean;
};

export function ProfilePortfolioSection({ photos, videos, canLike }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [likeOverlay, setLikeOverlay] = useState<Record<string, { likeCount: number; likedByMe: boolean }>>(
    {},
  );

  useEffect(() => {
    setLikeOverlay({});
  }, [photos]);

  const displayPhotos: LightboxPhoto[] = useMemo(
    () =>
      photos.map((p) => ({
        id: p.id,
        src: p.src,
        likeCount: likeOverlay[p.id]?.likeCount ?? p.likeCount,
        likedByMe: likeOverlay[p.id]?.likedByMe ?? p.likedByMe,
      })),
    [photos, likeOverlay],
  );

  const onLikeChange = useCallback((mediaId: string, likeCount: number, likedByMe: boolean) => {
    setLikeOverlay((prev) => ({ ...prev, [mediaId]: { likeCount, likedByMe } }));
  }, []);

  const openAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  if (photos.length === 0 && videos.length === 0) return null;

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Портфолио</h2>
        <div
          className={
            photos.length > 0
              ? "flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
              : "flex flex-col gap-6"
          }
        >
          {photos.length > 0 ? (
            <div className="w-full lg:min-w-0 lg:flex-1">
              <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl bg-muted">
                {displayPhotos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    className="group relative aspect-square overflow-hidden bg-muted text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => openAt(i)}
                    aria-label={`Открыть фото ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:opacity-95"
                    />
                    {p.likeCount > 0 ? (
                      <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        <Heart className="h-2.5 w-2.5 fill-rose-200 text-rose-200" aria-hidden />
                        {p.likeCount}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {videos.length > 0 ? (
            <div
              className={
                photos.length > 0
                  ? "w-full shrink-0 lg:w-[min(100%,340px)] xl:w-[min(100%,380px)]"
                  : "mx-auto w-full max-w-xl"
              }
            >
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  photos.length > 0 ? "mb-2 lg:mb-3" : "mb-2",
                )}
              >
                Видеовизитка
              </p>
              <div className="space-y-3">
                {videos.map((m) => (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-border bg-muted shadow-md"
                  >
                    <VideoWithPosterFrame src={m.src} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {displayPhotos.length > 0 ? (
        <PortfolioPhotoLightbox
          photos={displayPhotos}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          canLike={canLike}
          onLikeChange={onLikeChange}
        />
      ) : null}
    </>
  );
}
