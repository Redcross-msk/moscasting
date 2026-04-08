"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { toggleMediaFileLikeAction } from "@/features/media/media-like-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type LightboxPhoto = {
  id: string;
  src: string;
  likeCount: number;
  likedByMe: boolean;
};

type Props = {
  photos: LightboxPhoto[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Авторизован — можно лайкать; гость видит только счётчик (если > 0). */
  canLike: boolean;
  /** После лайка — обновить бейджи на сетке. */
  onLikeChange?: (mediaId: string, likeCount: number, likedByMe: boolean) => void;
};

export function PortfolioPhotoLightbox({
  photos,
  initialIndex,
  open,
  onOpenChange,
  canLike,
  onLikeChange,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [items, setItems] = useState(photos);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1)));
  }, [open, initialIndex, photos.length]);

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => (i < items.length - 1 ? i + 1 : i));
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext, onOpenChange]);

  async function onToggleLike() {
    if (!canLike || !current) return;
    const prev = items;
    const cur = prev[index];
    const optimisticLiked = !cur.likedByMe;
    const optimisticCount = Math.max(0, cur.likeCount + (optimisticLiked ? 1 : -1));
    setItems((arr) =>
      arr.map((p, i) =>
        i === index
          ? { ...p, likedByMe: optimisticLiked, likeCount: optimisticCount }
          : p,
      ),
    );
    const res = await toggleMediaFileLikeAction(cur.id);
    if (!res.ok) {
      setItems(prev);
      return;
    }
    setItems((arr) =>
      arr.map((p, i) =>
        i === index ? { ...p, likedByMe: res.liked, likeCount: res.likeCount } : p,
      ),
    );
    onLikeChange?.(cur.id, res.likeCount, res.liked);
  }

  if (!current || photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed left-0 top-0 z-50 h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 gap-0 border-0 bg-black/95 p-0 text-white shadow-none data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 sm:rounded-none"
        hideCloseButton
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Просмотр фото {index + 1} из {items.length}</DialogTitle>
        <div
          className="relative flex h-full w-full flex-col"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null) return;
            const end = e.changedTouches[0]?.clientX;
            if (end == null) return;
            const dx = end - start;
            if (dx > 56) goPrev();
            else if (dx < -56) goNext();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-2 sm:px-4">
            <span className="text-sm tabular-nums text-white/80">
              {index + 1} / {items.length}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="relative min-h-0 flex-1">
            {hasPrev ? (
              <button
                type="button"
                className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:block"
                onClick={goPrev}
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            ) : null}
            {hasNext ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:block"
                onClick={goNext}
                aria-label="Следующее фото"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            ) : null}

            <div className="flex h-full items-center justify-center px-2 pb-24 pt-2 sm:px-8 sm:pb-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.id}
                src={current.src}
                alt=""
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 to-transparent px-4 pb-6 pt-12">
            {canLike ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  "gap-2 rounded-full",
                  current.likedByMe && "border-rose-400/60 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30",
                )}
                onClick={() => void onToggleLike()}
              >
                <Heart className={cn("h-4 w-4", current.likedByMe && "fill-current")} aria-hidden />
                {current.likedByMe ? "Вам нравится" : "Нравится"}
              </Button>
            ) : null}
            {current.likeCount > 0 ? (
              <p className="text-sm text-white/85">{current.likeCount} лайков</p>
            ) : null}
            {!canLike && current.likeCount === 0 ? (
              <p className="text-center text-xs text-white/50">Войдите, чтобы поставить лайк</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
