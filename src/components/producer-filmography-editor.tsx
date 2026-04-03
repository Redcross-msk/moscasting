"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  addFilmographyEntryAction,
  deleteFilmographyEntryAction,
} from "@/features/producer-filmography/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FilmographyEntryRow = {
  id: string;
  title: string;
  releaseDate: Date | null;
  kinopoiskUrl: string | null;
  posterPublicUrl: string | null;
};

export function ProducerFilmographyEditor({ entries }: { entries: FilmographyEntryRow[] }) {
  const router = useRouter();
  const posterRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [kinopoiskUrl, setKinopoiskUrl] = useState("");

  function resetForm() {
    setTitle("");
    setReleaseDate("");
    setKinopoiskUrl("");
    setErr(null);
    if (posterRef.current) posterRef.current.value = "";
  }

  function submitAdd() {
    setErr(null);
    const fd = new FormData();
    fd.set("title", title.trim());
    if (releaseDate.trim()) fd.set("releaseDate", releaseDate.trim());
    if (kinopoiskUrl.trim()) fd.set("kinopoiskUrl", kinopoiskUrl.trim());
    const file = posterRef.current?.files?.[0];
    if (file && file.size > 0) fd.set("poster", file);

    start(async () => {
      try {
        await addFilmographyEntryAction(fd);
        resetForm();
        setOpen(false);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Не удалось сохранить");
      }
    });
  }

  return (
    <div className="space-y-4 border-t border-border pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-primary">Фильмография</h2>
          <p className="text-xs text-muted-foreground">
            Постер загружается с устройства (JPEG, PNG, WebP, до 12 МБ). Название, дата выхода и ссылка на Кинопоиск.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button type="button" variant="secondary" size="sm">
              + Добавить проект
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новый проект в фильмографии</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fg-title">Название проекта</Label>
                <Input
                  id="fg-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fg-date">Дата выхода</Label>
                <Input
                  id="fg-date"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fg-kp">Ссылка на Кинопоиск</Label>
                <Input
                  id="fg-kp"
                  type="url"
                  value={kinopoiskUrl}
                  onChange={(e) => setKinopoiskUrl(e.target.value)}
                  placeholder="https://www.kinopoisk.ru/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fg-poster">Постер (файл с устройства)</Label>
                <Input
                  id="fg-poster"
                  ref={posterRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                />
              </div>
              {err ? <p className="text-sm text-destructive">{err}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button type="button" disabled={pending || !title.trim()} onClick={submitAdd}>
                  {pending ? "Сохранение…" : "Добавить"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет записей — добавьте проект кнопкой выше.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
            >
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {e.posterPublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.posterPublicUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                    Нет постера
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{e.title}</p>
                {e.releaseDate ? (
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(e.releaseDate))}
                  </p>
                ) : null}
                {e.kinopoiskUrl ? (
                  <a
                    href={e.kinopoiskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Кинопоиск <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={pending}
                aria-label="Удалить"
                onClick={() => {
                  start(async () => {
                    try {
                      await deleteFilmographyEntryAction(e.id);
                      router.refresh();
                    } catch (ex) {
                      console.error(ex);
                    }
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
