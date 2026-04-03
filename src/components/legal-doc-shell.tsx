import Link from "next/link";
import { auth } from "@/auth";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { Button } from "@/components/ui/button";

export async function LegalDocShell({ title, children }: { title: string; children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/explore?tab=castings">На главную</Link>
        </Button>
        {role ? (
          <ExploreRoleBar role={role} />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/register">Регистрация</Link>
            </Button>
          </div>
        )}
      </div>
      <article>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-sm sm:p-8">
          {children}
        </div>
      </article>
    </div>
  );
}

export function LegalEntityIntro() {
  return (
    <div className="space-y-2 border-b border-border pb-5 text-foreground">
      <p className="font-semibold text-foreground">Оператор сервиса</p>
      <p>
        Наименование: <strong>МОСКАСТИНГ</strong>
      </p>
      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
        <li>ИНН / КПП / ОГРН: —</li>
        <li>Юридический адрес: —</li>
        <li>Электронная почта для обращений: —</li>
      </ul>
      <p className="text-xs text-muted-foreground">
        Реквизиты и контакты будут указаны после регистрации юридического лица. Текст носит ознакомительный характер.
      </p>
    </div>
  );
}
