import { ChatsRouteHeightShell } from "@/components/chats-route-height-shell";

/**
 * Высота под вьюпорт + на мобильных пересчёт по visualViewport (клавиатура не оставляет дыру).
 */
export default function ActorChatsLayout({ children }: { children: React.ReactNode }) {
  return <ChatsRouteHeightShell>{children}</ChatsRouteHeightShell>;
}
