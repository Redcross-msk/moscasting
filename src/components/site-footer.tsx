import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/offer", label: "Публичная оферта" },
  { href: "/cookies", label: "Файлы cookie" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} МОСКАСТИНГ. Все права защищены.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-end">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-primary underline-offset-4 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
