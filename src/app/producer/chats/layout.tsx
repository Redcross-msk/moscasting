/** См. actor/chats/layout.tsx — та же схема для продюсера. */
export default function ProducerChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100dvh-10.5rem)] max-h-[calc(100dvh-10.5rem)] min-h-0 w-full flex-col overflow-hidden sm:h-[calc(100dvh-11.5rem)] sm:max-h-[calc(100dvh-11.5rem)]">
      {children}
    </div>
  );
}
