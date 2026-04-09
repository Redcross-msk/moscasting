"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Показывает кадр из видео как poster (как обложка), чтобы не было «чёрного экрана» до нажатия Play.
 * Работает для того же origin (`/api/media/...` или прямой URL).
 */
export function VideoWithPosterFrame({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [posterReady, setPosterReady] = useState(false);

  useEffect(() => {
    setPoster(null);
    setPosterReady(false);
    const v = videoRef.current;
    if (!v) return;

    const capture = () => {
      try {
        if (!v.videoWidth || !v.videoHeight) return;
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(v, 0, 0);
        const url = c.toDataURL("image/jpeg", 0.82);
        setPoster(url);
        setPosterReady(true);
      } catch {
        /* CORS / security — остаётся только стандартный poster */
      }
    };

    const onLoadedData = () => {
      try {
        v.currentTime = 0.1;
      } catch {
        capture();
      }
    };

    const onSeeked = () => {
      capture();
    };

    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("seeked", onSeeked);
    return () => {
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("seeked", onSeeked);
    };
  }, [src]);

  return (
    <div className={className ?? ""}>
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        className="aspect-video w-full bg-muted"
        preload="metadata"
        poster={poster ?? undefined}
        style={posterReady ? undefined : { background: "linear-gradient(180deg, #27272a 0%, #18181b 100%)" }}
      />
    </div>
  );
}
