"use client";

import { Check, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHAT_INBOX_SORT_OPTIONS, type ChatInboxSortMode } from "@/lib/chat-inbox-sort";
import { cn } from "@/lib/utils";

export function ChatInboxSortMenu({
  sortMode,
  onSortModeChange,
  className,
}: {
  sortMode: ChatInboxSortMode;
  onSortModeChange: (m: ChatInboxSortMode) => void;
  className?: string;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-9 shrink-0 gap-1.5 px-3 text-sm font-medium", className)}
        >
          <ListFilter className="h-4 w-4 opacity-70" aria-hidden />
          Сортировка
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)]">
        {CHAT_INBOX_SORT_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            className="flex cursor-pointer items-start gap-2 py-2 pl-2 pr-2"
            onSelect={(e) => {
              e.preventDefault();
              onSortModeChange(o.value);
            }}
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              {sortMode === o.value ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
            </span>
            <span className="min-w-0 flex-1 text-sm leading-snug">{o.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
