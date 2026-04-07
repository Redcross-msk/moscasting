import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Баннер между кастингами и актёрами: диагональное разделение (на мобиле — два блока друг под другом). */
export function HomeServicesBanner() {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border shadow-sm",
        "min-h-[min(100vw,420px)] md:min-h-[260px]",
      )}
      aria-label="Обучение и портфолио"
    >
      {/* Мобильная версия: два блока */}
      <div className="flex flex-col md:hidden">
        <div className="border-b border-border bg-gradient-to-br from-primary/[0.12] to-background px-4 py-6 sm:px-5">
          <h3 className="text-lg font-bold text-foreground">Курсы актёрского мастерства</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>8 и 16-часовые программы для актёров второго плана и массовки.</li>
            <li>Сертификат государственного образца.</li>
            <li>Преподаватели из ведущих вузов страны.</li>
          </ul>
          <Button className="mt-5 w-full sm:w-auto" asChild>
            <Link href="/obuchenie">Записаться на курсы</Link>
          </Button>
        </div>
        <div className="bg-gradient-to-tl from-muted/80 to-background px-4 py-6 sm:px-5">
          <Button className="mb-4 w-full sm:w-auto" variant="secondary" asChild>
            <Link href="/portfolio">Записаться на портфолио</Link>
          </Button>
          <h3 className="text-lg font-bold text-foreground">Портфолио и видеовизитка</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Профессиональное фото- и видеопортфолио по государственным стандартам — для кастингов, агентств и
            самопрезентации.
          </p>
        </div>
      </div>

      {/* Десктоп: два треугольника по диагонали */}
      <div className="relative hidden min-h-[260px] md:block">
        <div className="absolute inset-0 bg-muted/40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.14] to-primary/[0.04]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-tl from-muted/90 to-background"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
          aria-hidden
        />
        <div className="relative z-10 grid min-h-[260px] grid-cols-2">
          <div className="flex flex-col justify-between p-8 pr-5 lg:p-10 lg:pr-8">
            <div className="max-w-[95%]">
              <h3 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                Курсы актёрского мастерства
              </h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
                <li>У нас вы пройдёте 8 и 16-часовой курс актёрского мастерства — актёры второго плана и массовки.</li>
                <li>Сертификат государственного образца.</li>
                <li>Преподаватели из лучших вузов страны.</li>
              </ul>
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link href="/obuchenie">Записаться на курсы</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-end justify-end p-8 pl-5 text-right lg:p-10 lg:pl-8">
            <div className="flex max-w-[95%] flex-col items-end">
              <Button className="mb-5" variant="secondary" asChild>
                <Link href="/portfolio">Записаться на портфолио</Link>
              </Button>
              <h3 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">Портфолио и видеовизитка</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
                Наша команда подготовит для вас профессиональное фото- и видеопортфолио государственного стандарта.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
