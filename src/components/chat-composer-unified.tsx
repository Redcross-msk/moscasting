"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Send, X } from "lucide-react";
import { sendChatMessageAction } from "@/features/chat/actions";
import { uploadAndSendChatFileAction } from "@/features/chat/upload-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf";

export function ChatComposerUnified({
  chatId,
  disabled,
  onAfterSend,
  compact,
}: {
  chatId: string;
  disabled?: boolean;
  /** Для инбокса — перезагрузить панель без полного refresh */
  onAfterSend?: () => void;
  /** Чуть плотнее отступы в списке чатов */
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function clearFile() {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function onPickFile(f: File | null) {
    clearFile();
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  }

  const canSend = (body.trim().length > 0 || !!file) && !pending;

  function submit() {
    setErr(null);
    start(async () => {
      try {
        if (file) {
          const fd = new FormData();
          fd.set("file", file);
          const cap = body.trim() || (file.name ? `📎 ${file.name}` : "Вложение");
          fd.set("caption", cap);
          const res = await uploadAndSendChatFileAction(chatId, fd);
          if (res.error) {
            setErr(res.error);
            return;
          }
          setBody("");
          clearFile();
        } else {
          const t = body.trim();
          if (!t) return;
          await sendChatMessageAction(chatId, t);
          setBody("");
        }
        onAfterSend?.();
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Ошибка отправки");
      }
    });
  }

  if (disabled) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground sm:text-sm">
        Чат закрыт. Сообщения недоступны.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", compact ? "" : "pt-1")}>
      {file ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
              файл
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {file.type.startsWith("video/") ? "Видео" : file.type.startsWith("image/") ? "Фото" : "Документ"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {err ? <p className="text-xs text-destructive">{err}</p> : null}

      <div
        className={cn(
          "flex items-end gap-1.5 rounded-2xl border border-border/80 bg-background pl-1 pr-1 pb-1 pt-1 shadow-sm",
          compact ? "sm:gap-2" : "sm:pl-2 sm:pr-2",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-label="Прикрепить файл"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </Button>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={file ? "Подпись к файлу (необязательно)" : "Сообщение…"}
          rows={1}
          disabled={pending}
          className="max-h-28 min-h-[2.25rem] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-base shadow-none focus-visible:ring-0 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) submit();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl"
          disabled={!canSend}
          onClick={() => submit()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {!compact ? (
        <p className="text-[10px] text-muted-foreground sm:text-xs">Enter — отправить · Shift+Enter — новая строка</p>
      ) : null}
    </div>
  );
}
