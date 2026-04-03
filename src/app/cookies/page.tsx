import { LegalDocShell, LegalEntityIntro } from "@/components/legal-doc-shell";

export const metadata = { title: "Файлы cookie — МОСКАСТИНГ" };

export default async function CookiesPage() {
  return (
    <LegalDocShell title="Использование файлов cookie">
      <LegalEntityIntro />
      <div className="space-y-4 text-foreground">
        <p>
          Сайт <strong>МОСКАСТИНГ</strong> может использовать файлы cookie и аналогичные технологии для работы сеанса
          входа, сохранения настроек и анализа трафика.
        </p>
        <h2 className="text-base font-semibold text-foreground">Какие cookie мы используем</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Необходимые</strong> — для авторизации и безопасности (например, сессия NextAuth).
          </li>
          <li>
            <strong>Функциональные</strong> — для запоминания предпочтений интерфейса (при наличии).
          </li>
        </ul>
        <h2 className="text-base font-semibold text-foreground">Управление</h2>
        <p>
          Вы можете отключить cookie в настройках браузера; в этом случае часть функций сайта (вход в аккаунт) может
          стать недоступна.
        </p>
      </div>
    </LegalDocShell>
  );
}
