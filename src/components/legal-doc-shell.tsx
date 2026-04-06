import Link from "next/link";
import { auth } from "@/auth";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { Button } from "@/components/ui/button";

export async function LegalDocShell({ title, children }: { title: string; children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  const navBtn =
    "h-9 min-h-9 min-w-0 flex-1 justify-center px-1.5 text-center text-[11px] leading-tight sm:flex-none sm:px-3 sm:text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex flex-row flex-nowrap items-stretch gap-1.5 border-b border-border pb-4 sm:gap-2">
        <Button variant="outline" size="sm" className={navBtn} asChild>
          <Link href="/explore?tab=castings">На главную</Link>
        </Button>
        {role ? (
          <div className="min-w-0 flex-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0">
            <ExploreRoleBar role={role} />
          </div>
        ) : (
          <>
            <Button variant="outline" size="sm" className={navBtn} asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="secondary" size="sm" className={navBtn} asChild>
              <Link href="/register">Регистрация</Link>
            </Button>
          </>
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
      <p className="text-xs text-muted-foreground">Актуальная редакция документа указывается в начале текста ниже.</p>
      <p className="font-semibold text-foreground">Оператор сервиса</p>
      <p>
        Наименование: <strong>МОСКАСТИНГ</strong>
      </p>
      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
        <li>Полное наименование юридического лица / ИП: —</li>
        <li>ИНН / КПП / ОГРН: —</li>
        <li>Юридический адрес: —</li>
        <li>Электронная почта для обращений по персональным данным и правовым вопросам: —</li>
      </ul>
      <p className="text-xs text-muted-foreground">
        Сведения об операторе и реквизиты подлежат заполнению после государственной регистрации юридического лица /
        индивидуального предпринимателя. До заполнения соответствующие поля обозначены прочерком (—).
      </p>
    </div>
  );
}
