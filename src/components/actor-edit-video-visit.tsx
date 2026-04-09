"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { deleteActorPortfolioVideoAction } from "@/features/media/actions";
import { uploadActorPortfolioVideoFormAction } from "@/features/media/upload-actions";
import { Button } from "@/components/ui/button";
import { VideoWithPosterFrame } from "@/components/video-with-poster-frame";
import { MAX_ACTOR_PORTFOLIO_VIDEOS } from "@/lib/actor-portfolio-limits";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

type VideoItem = { id: string; publicUrl: string | null; storageKey?: string };

export function ActorEditVideoVisit({ portfolioVideos }: { portfolioVideos: VideoItem[] }) {
  const router = useRouter();
  const [videoPending, startVideoTransition] = useTransition();
  const [videoDeletePending, startVideoDelete] = useTransition();
  const [videoErr, setVideoErr] = useState<string | null>(null);
  const [videoMutErr, setVideoMutErr] = useState<string | null>(null);
  const [videoPickPreview, setVideoPickPreview] = useState<string | null>(null);
  const [videoUrlAfterUpload, setVideoUrlAfterUpload] = useState<string | null>(null);
  const [videoStorageKeyAfterUpload, setVideoStorageKeyAfterUpload] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const atVideoLimit = portfolioVideos.length >= MAX_ACTOR_PORTFOLIO_VIDEOS;
  const justUploadedResolved = resolveUploadedMediaSrc(videoUrlAfterUpload, videoStorageKeyAfterUpload);
  const hasSavedVideoVisit =
    portfolioVideos.some((v) => resolveUploadedMediaSrc(v.publicUrl, v.storageKey ?? null)) ||
    Boolean(justUploadedResolved);

  function videoSrc(v: VideoItem): string | null {
    return resolveUploadedMediaSrc(v.publicUrl, v.storageKey ?? null);
  }

  return (
    <div className="space-y-4 border-t border-border pt-10">
      <div>
        <h2 className="text-sm font-semibold text-primary">Видеовизитка</h2>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, MOV, до 120 МБ. До {MAX_ACTOR_PORTFOLIO_VIDEOS} роликов (отдельно от фото).
        </p>
      </div>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
        className="sr-only"
        onChange={(e) => {
          const input = e.target;
          const file = input.files?.[0];
          input.value = "";
          if (!file) return;
          setVideoErr(null);
          const url = URL.createObjectURL(file);
          setVideoPickPreview(url);
          const fd = new FormData();
          fd.append("video", file);
          startVideoTransition(async () => {
            const res = await uploadActorPortfolioVideoFormAction(fd);
            if (res.error) {
              setVideoErr(res.error);
              URL.revokeObjectURL(url);
              setVideoPickPreview(null);
              return;
            }
            URL.revokeObjectURL(url);
            setVideoPickPreview(null);
            if (res.publicUrl) setVideoUrlAfterUpload(res.publicUrl);
            setVideoStorageKeyAfterUpload(res.storageKey ?? null);
            router.refresh();
          });
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={videoPending || videoDeletePending || atVideoLimit}
        onClick={() => videoInputRef.current?.click()}
      >
        {portfolioVideos.length === 0
          ? "Добавить видеовизитку"
          : atVideoLimit
            ? `Лимит: ${MAX_ACTOR_PORTFOLIO_VIDEOS} видео`
            : `Добавить ещё видеовизитку (${portfolioVideos.length}/${MAX_ACTOR_PORTFOLIO_VIDEOS})`}
      </Button>
      {videoErr ? <p className="text-sm text-destructive">{videoErr}</p> : null}
      {videoMutErr ? <p className="text-sm text-destructive">{videoMutErr}</p> : null}
      {(portfolioVideos.some((v) => videoSrc(v)) || videoPickPreview || justUploadedResolved) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {portfolioVideos
            .filter((v) => videoSrc(v))
            .map((v) => {
              const src = videoSrc(v)!;
              return (
                <div key={v.id} className="relative overflow-hidden rounded-md border bg-muted">
                  <div className="relative">
                    <VideoWithPosterFrame src={src} />
                    <div className="absolute right-1 top-1 z-10">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full border border-border bg-background/95 shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                        disabled={videoPending || videoDeletePending}
                        aria-label="Удалить видеовизитку"
                        onClick={() => {
                          startVideoDelete(async () => {
                            setVideoMutErr(null);
                            const fd = new FormData();
                            fd.set("mediaId", v.id);
                            const res = await deleteActorPortfolioVideoAction(fd);
                            if (!res.ok) {
                              setVideoMutErr(res.error);
                              return;
                            }
                            if (justUploadedResolved && src === justUploadedResolved) {
                              setVideoUrlAfterUpload(null);
                              setVideoStorageKeyAfterUpload(null);
                            }
                            router.refresh();
                          });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          {justUploadedResolved &&
          !portfolioVideos.some((v) => videoSrc(v) === justUploadedResolved) ? (
            <div key="just-uploaded" className="overflow-hidden rounded-md border">
              <VideoWithPosterFrame src={justUploadedResolved} />
            </div>
          ) : null}
          {videoPickPreview ? (
            <div className="overflow-hidden rounded-md border border-dashed border-primary/50">
              <VideoWithPosterFrame src={videoPickPreview} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
