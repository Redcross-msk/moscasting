"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { uploadActorAvatarFormAction } from "@/features/media/upload-actions";
import { deleteActorPortfolioPhotoAction, moveActorMediaAction } from "@/features/media/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

type PortfolioPhotoItem = {
  id: string;
  publicUrl: string | null;
  sortOrder: number;
  storageKey?: string;
};

type StagedPortfolioPhoto = {
  id: string;
  batchId: string;
  previewUrl: string;
  uploading: boolean;
};

function resolvePhotoSrc(p: Pick<PortfolioPhotoItem, "publicUrl" | "storageKey">): string | null {
  return resolveUploadedMediaSrc(p.publicUrl, p.storageKey ?? null);
}

function mergePortfolioPhotos(server: PortfolioPhotoItem[], extra: PortfolioPhotoItem[]): PortfolioPhotoItem[] {
  const map = new Map<string, PortfolioPhotoItem>();
  for (const p of server) map.set(p.id, { ...p });
  for (const p of extra) {
    const cur = map.get(p.id);
    if (!cur) {
      map.set(p.id, { ...p });
      continue;
    }
    const curOk = !!resolvePhotoSrc(cur);
    const extOk = !!resolvePhotoSrc(p);
    if (!curOk && extOk) {
      map.set(p.id, {
        ...cur,
        publicUrl: p.publicUrl,
        storageKey: p.storageKey,
        sortOrder: p.sortOrder,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ActorEditMediaUploads({
  initialAvatarUrl,
  portfolioPhotos: portfolioPhotosFromServer,
}: {
  initialAvatarUrl: string | null;
  portfolioPhotos: PortfolioPhotoItem[];
}) {
  const router = useRouter();
  const [avatarPending, startAvatarTransition] = useTransition();
  const [portfolioMutPending, startPortfolioMut] = useTransition();

  const [avatarErr, setAvatarErr] = useState<string | null>(null);
  const [photosErr, setPhotosErr] = useState<string | null>(null);
  const [portfolioMutErr, setPortfolioMutErr] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrlAfterUpload, setAvatarUrlAfterUpload] = useState<string | null>(null);
  const [extraPortfolioPhotos, setExtraPortfolioPhotos] = useState<PortfolioPhotoItem[]>([]);
  const [photosOk, setPhotosOk] = useState(false);

  const [stagedPortfolio, setStagedPortfolio] = useState<StagedPortfolioPhoto[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setAvatarUrlAfterUpload(null);
  }, [initialAvatarUrl]);

  const avatarDisplayRaw = avatarPreview ?? avatarUrlAfterUpload ?? initialAvatarUrl;
  const avatarDisplay =
    avatarPreview ?? resolveUploadedMediaSrc(avatarUrlAfterUpload ?? initialAvatarUrl, null);

  useEffect(() => {
    const serverIds = new Set(portfolioPhotosFromServer.map((p) => p.id));
    setExtraPortfolioPhotos((prev) => prev.filter((p) => !serverIds.has(p.id)));
  }, [portfolioPhotosFromServer]);

  const mergedPortfolioPhotos = useMemo(
    () => mergePortfolioPhotos(portfolioPhotosFromServer, extraPortfolioPhotos),
    [portfolioPhotosFromServer, extraPortfolioPhotos],
  );

  const showPhotoGrid =
    mergedPortfolioPhotos.length > 0 || stagedPortfolio.length > 0 || photosUploading;

  function cancelStagedBatch(batchId: string) {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setStagedPortfolio((prev) => {
      prev.filter((s) => s.batchId === batchId).forEach((s) => URL.revokeObjectURL(s.previewUrl));
      return prev.filter((s) => s.batchId !== batchId);
    });
    setPhotosUploading(false);
  }

  function uploadPortfolioFiles(files: File[]) {
    if (!files.length) return;

    if (process.env.NODE_ENV === "development") {
      console.log("[портфолио] выбрано файлов:", files.length, files.map((f) => f.name));
    }

    setPhotosErr(null);

    const batchId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `batch-${Date.now()}`;

    const staged: StagedPortfolioPhoto[] = files.map((file) => ({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      batchId,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setStagedPortfolio((prev) => [...prev, ...staged]);
    setPhotosUploading(true);

    const batchIds = new Set(staged.map((s) => s.id));
    const fd = new FormData();
    files.forEach((f) => fd.append("photos", f));

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const ac = new AbortController();
    uploadAbortRef.current = ac;

    void (async () => {
      try {
        const r = await fetch(`${origin}/api/actor/portfolio-photos`, {
          method: "POST",
          body: fd,
          credentials: "include",
          cache: "no-store",
          signal: ac.signal,
        });

        const text = await r.text();
        let data: {
          error?: string;
          added?: Array<{
            id: string;
            publicUrl: string | null;
            sortOrder: number;
            storageKey: string;
          }>;
        } = {};

        try {
          data = text ? (JSON.parse(text) as typeof data) : {};
        } catch {
          console.error("[портфолио] ответ не JSON:", text.slice(0, 300));
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[портфолио] ответ API", r.status, data);
        }

        if (!r.ok || data.error) {
          setPhotosErr(data.error ?? `Ошибка ${r.status}`);
          setStagedPortfolio((prev) => {
            prev.filter((x) => batchIds.has(x.id)).forEach((x) => URL.revokeObjectURL(x.previewUrl));
            return prev.filter((x) => !batchIds.has(x.id));
          });
          return;
        }

        const added = data.added ?? [];
        if (added.length > 0) {
          flushSync(() => {
            setExtraPortfolioPhotos((prev) => {
              const m = new Map<string, PortfolioPhotoItem>();
              for (const p of prev) m.set(p.id, p);
              for (const a of added) {
                m.set(a.id, {
                  id: a.id,
                  publicUrl: a.publicUrl,
                  sortOrder: a.sortOrder,
                  storageKey: a.storageKey,
                });
              }
              return [...m.values()];
            });
          });
        }

        setStagedPortfolio((prev) => {
          prev.filter((x) => batchIds.has(x.id)).forEach((x) => URL.revokeObjectURL(x.previewUrl));
          return prev.filter((x) => !batchIds.has(x.id));
        });

        setPhotosOk(true);
        window.setTimeout(() => setPhotosOk(false), 3000);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("[портфолио] ошибка сети или запроса:", e);
        setPhotosErr(e instanceof Error ? e.message : "Не удалось отправить фото");
        setStagedPortfolio((prev) => {
          prev.filter((x) => batchIds.has(x.id)).forEach((x) => URL.revokeObjectURL(x.previewUrl));
          return prev.filter((x) => !batchIds.has(x.id));
        });
      } finally {
        uploadAbortRef.current = null;
        setPhotosUploading(false);
      }
    })();
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-primary">Аватар</h3>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-muted bg-muted shadow-inner">
            {avatarDisplay ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={avatarDisplayRaw ?? "av"}
                src={avatarDisplay}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
                Нет фото
              </div>
            )}
            {avatarPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-xs font-medium">
                Загрузка…
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif"
              className="sr-only"
              onChange={(e) => {
                const input = e.target;
                const file = input.files?.[0];
                input.value = "";
                if (!file) return;
                setAvatarErr(null);
                const url = URL.createObjectURL(file);
                setAvatarPreview(url);
                const fd = new FormData();
                fd.append("avatar", file);
                startAvatarTransition(async () => {
                  const res = await uploadActorAvatarFormAction(fd);
                  if (res.error) {
                    setAvatarErr(res.error);
                    URL.revokeObjectURL(url);
                    setAvatarPreview(null);
                    return;
                  }
                  URL.revokeObjectURL(url);
                  setAvatarPreview(null);
                  if (res.publicUrl) setAvatarUrlAfterUpload(res.publicUrl);
                });
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={avatarPending}
              onClick={() => avatarInputRef.current?.click()}
            >
              Загрузить фото аватара
            </Button>
            {avatarErr ? <p className="text-sm text-destructive">{avatarErr}</p> : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-primary">Фото в портфолио</h3>
          <p className="text-xs text-muted-foreground">
            Выберите файлы — превью появится сразу, затем фото отправятся на сервер.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            ref={portfolioInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif"
            multiple
            className="sr-only"
            disabled={photosUploading}
            onChange={(e) => {
              const input = e.target;
              const files = input.files?.length ? Array.from(input.files) : [];
              input.value = "";
              if (!files.length) return;
              uploadPortfolioFiles(files);
            }}
          />
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "w-fit",
              photosUploading && "pointer-events-none opacity-60",
            )}
            disabled={photosUploading}
            onClick={() => portfolioInputRef.current?.click()}
          >
            {photosUploading ? "Отправляем на сервер…" : "Добавить фото"}
          </button>
        </div>

        {photosErr ? <p className="text-sm text-destructive">{photosErr}</p> : null}
        {portfolioMutErr ? <p className="text-sm text-destructive">{portfolioMutErr}</p> : null}
        {photosOk ? (
          <p className="text-sm font-medium text-primary" role="status">
            Фото сохранены.
          </p>
        ) : null}

        {showPhotoGrid ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {mergedPortfolioPhotos.map((p, orderableIndex) => {
              const src = resolvePhotoSrc(p);

              return (
                <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/15 p-2">
                  <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                        Превью недоступно
                      </div>
                    )}
                    <div className="absolute right-1 top-1 z-10">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full border border-border bg-background/95 shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                        disabled={photosUploading || portfolioMutPending}
                        aria-label="Удалить фото"
                        onClick={() => {
                          startPortfolioMut(async () => {
                            setPortfolioMutErr(null);
                            const fd = new FormData();
                            fd.set("mediaId", p.id);
                            const res = await deleteActorPortfolioPhotoAction(fd);
                            if (!res.ok) {
                              setPortfolioMutErr(res.error);
                              return;
                            }
                            setExtraPortfolioPhotos((prev) => prev.filter((x) => x.id !== p.id));
                            router.refresh();
                          });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 min-w-8 px-0"
                      disabled={orderableIndex === 0 || photosUploading || portfolioMutPending}
                      onClick={() => {
                        startPortfolioMut(async () => {
                          setPortfolioMutErr(null);
                          const fd = new FormData();
                          fd.set("mediaId", p.id);
                          fd.set("direction", "up");
                          const res = await moveActorMediaAction(fd);
                          if (!res.ok) setPortfolioMutErr(res.error);
                          else router.refresh();
                        });
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 min-w-8 px-0"
                      disabled={
                        orderableIndex >= mergedPortfolioPhotos.length - 1 ||
                        photosUploading ||
                        portfolioMutPending
                      }
                      onClick={() => {
                        startPortfolioMut(async () => {
                          setPortfolioMutErr(null);
                          const fd = new FormData();
                          fd.set("mediaId", p.id);
                          fd.set("direction", "down");
                          const res = await moveActorMediaAction(fd);
                          if (!res.ok) setPortfolioMutErr(res.error);
                          else router.refresh();
                        });
                      }}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              );
            })}

            {stagedPortfolio.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.previewUrl} alt="" className="h-full w-full object-cover" />
                  {s.uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-xs font-medium">
                      <span className="mb-1">Отправка…</span>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/95 shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => cancelStagedBatch(s.batchId)}
                    aria-label="Отменить загрузку"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground">С вашего устройства</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
