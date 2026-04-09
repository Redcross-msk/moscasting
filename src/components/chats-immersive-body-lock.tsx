"use client";

import { useEffect } from "react";

/** В разделе чатов страница не скроллится целиком — только лента сообщений внутри панели. */
export function ChatsImmersiveBodyLock() {
  useEffect(() => {
    document.documentElement.classList.add("chat-immersive");
    document.body.classList.add("chat-immersive");
    return () => {
      document.documentElement.classList.remove("chat-immersive");
      document.body.classList.remove("chat-immersive");
    };
  }, []);
  return null;
}
