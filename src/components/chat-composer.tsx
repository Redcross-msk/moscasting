"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessageAction } from "@/features/chat/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({ chatId }: { chatId: string }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await sendChatMessageAction(chatId, body);
          setBody("");
          router.refresh();
        });
      }}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Сообщение…"
        rows={3}
      />
      <Button type="submit" disabled={pending || !body.trim()}>
        Отправить
      </Button>
    </form>
  );
}
