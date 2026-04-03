"use client";

import { useRef, useState, useTransition } from "react";
import { uploadActorPortfolioVideoFormAction } from "@/features/media/upload-actions";
import { Button } from "@/components/ui/button";

type VideoItem = { id: string; publicUrl: string | null };

export function ActorEditVideoVisit({ portfolioVideos }: { portfolioVideos: VideoItem[] }) {
  const [videoPending, startVideoTransition] = useTransition();
  const [videoErr, setVideoErr] = useState<string | null>(null);
  const [videoPickPreview, setVideoPickPreview] = useState<string | null>(null);
  const [videoUrlAfterUpload, setVideoUrlAfterUpload] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hasSavedVideoVisit =
    portfolioVideos.some((v) => v.publicUrl) || Boolean(videoUrlAfterUpload);

  return (
    <div className="space-y-4 border-t border-border pt-10">
      <div>
        <h2 className="text-sm font-semibold text-primary">Видеовизитка</h2>
        <p className="text-xs text-muted-foreground">MP4, WebM, MOV, до 120 МБ.</p>
      </div>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
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
          });
        }}
      />
      <Button type="button" variant="outline" disabled={videoPending} onClick={() => videoInputRef.current?.click()}>
        {hasSavedVideoVisit ? "Изменить видеовизитку" : "Добавить видеовизитку"}
      </Button>
      {videoErr ? <p className="text-sm text-destructive">{videoErr}</p> : null}
      {(portfolioVideos.some((v) => v.publicUrl) || videoPickPreview || videoUrlAfterUpload) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {portfolioVideos
            .filter((v) => v.publicUrl)
            .map((v) => (
              <video
                key={v.id}
                src={v.publicUrl!}
                controls
                className="aspect-video w-full rounded-md border bg-black"
                preload="metadata"
              />
            ))}
          {videoUrlAfterUpload && !portfolioVideos.some((v) => v.publicUrl === videoUrlAfterUpload) ? (
            <video
              key="just-uploaded"
              src={videoUrlAfterUpload}
              controls
              className="aspect-video w-full rounded-md border bg-black"
              preload="metadata"
            />
          ) : null}
          {videoPickPreview ? (
            <video
              src={videoPickPreview}
              controls
              className="aspect-video w-full rounded-md border border-dashed border-primary/50 bg-black"
              preload="metadata"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
