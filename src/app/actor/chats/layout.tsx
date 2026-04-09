import { ChatsImmersiveBodyLock } from "@/components/chats-immersive-body-lock";
import { ChatsRouteHeightShell } from "@/components/chats-route-height-shell";

export default function ActorChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChatsImmersiveBodyLock />
      <ChatsRouteHeightShell>{children}</ChatsRouteHeightShell>
    </>
  );
}
