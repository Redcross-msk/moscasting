import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Баннер: две половины; на мобиле в каждой — заголовок, абзац и кнопка в одном блоке. */
export function HomeServicesBanner() {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border shadow-sm",
        "md:grid md:min-h-[280px] md:grid-cols-2 md:divide-x md:divide-border",
      )}
      aria-label="Обучение и портфолио"
    >
      {/* Мобильная версия: один непрерывный блок на половину — заголовок, абзац, кнопка */}
      <div className="flex flex-col md:hidden">
        <div className="border-b border-border bg-muted/40 px-4 py-6 sm:px-5">
          <h3 className="text-lg font-bold text-foreground">Курсы актёрского мастерства</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            8- и 16-часовые программы для актёров второго плана и массовки: сертификат государственного образца и
            преподаватели из ведущих вузов страны.
          </p>
          <Button className="mt-4 w-full sm:w-auto" asChild>
            <Link href="/obuchenie">Записаться на курсы</Link>
          </Button>
        </div>
        <div className="bg-muted/40 px-4 py-6 sm:px-5">
          <h3 className="text-lg font-bold text-foreground">Портфолио и видеовизитка</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Профессиональное фото- и видеопортфолио по государственным стандартам — для кастингов, агентств и
            самопрезентации.
          </p>
          <Button className="mt-4 w-full sm:w-auto" asChild>
            <Link href="/portfolio">Записаться на портфолио</Link>
          </Button>
        </div>
      </div>

      {/* Десктоп: две колонки 50/50, контент не пересекает границу */}
      <div className="hidden min-h-0 flex-col justify-between bg-gradient-to-br from-primary/[0.12] to-background p-8 lg:p-10 md:flex">
        <div className="min-w-0 max-w-full pr-0">
          <h3 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            Курсы актёрского мастерства
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
            8- и 16-часовые программы для актёров второго плана и массовки: сертификат государственного образца и
            преподаватели из ведущих вузов страны.
          </p>
        </div>
        <div className="mt-8 shrink-0">
          <Button asChild>
            <Link href="/obuchenie">Записаться на курсы</Link>
          </Button>
        </div>
      </div>

      <div className="hidden min-h-0 flex-col items-stretch justify-between bg-muted/35 p-8 lg:p-10 md:flex">
        <div className="flex min-w-0 max-w-full flex-col items-end text-right">
          <Button className="mb-5 shrink-0" asChild>
            <Link href="/portfolio">Записаться на портфолио</Link>
          </Button>
          <h3 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">Портфолио и видеовизитка</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
            Наша команда подготовит для вас профессиональное фото- и видеопортфолио государственного стандарта.
          </p>
        </div>
      </div>
    </section>
  );
}
