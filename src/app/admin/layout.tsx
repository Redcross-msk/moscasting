import Link from "next/link";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/homepage", label: "Главная (слоты)" },
  { href: "/admin/moderation", label: "Модерация кастингов" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/castings", label: "Кастинги" },
  { href: "/admin/obuchenie", label: "Обучение" },
  { href: "/admin/portfolio", label: "Портфолио" },
  { href: "/admin/reports", label: "Жалобы" },
  { href: "/admin/chats", label: "Чаты" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav
        className="flex max-w-full gap-2 overflow-x-auto border-b border-destructive/20 pb-3 text-xs [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:gap-3 sm:overflow-visible sm:text-sm"
        aria-label="Разделы админки"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 whitespace-nowrap font-medium text-primary hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
