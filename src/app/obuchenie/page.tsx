import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { CourseLeadForm } from "@/components/course-lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Обучение — МОСКАСТИНГ",
  description: "Курсы актёрского мастерства: 8 и 16 часов, сертификат государственного образца.",
};

export default async function ObucheniePage() {
  const session = await auth();
  const homeHref = session ? "/explore?tab=castings" : "/";

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-12">
      <Button variant="outline" size="sm" className="w-fit" asChild>
        <Link href={homeHref}>
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
          На главную
        </Link>
      </Button>
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Актёрское мастерство</h1>
        <p className="text-lg text-muted-foreground">
          Практико-ориентированные программы для тех, кто хочет уверенно работать на площадке: от массовки и второго
          плана до устойчивых навыков самопрезентации перед камерой.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>8 часов</CardTitle>
            <CardDescription>Интенсив за один день</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">3 часа</span> — теория: основы профессии, поведение на
              съёмочной площадке, взаимодействие с режиссёром и группой.
            </p>
            <p>
              <span className="font-semibold text-foreground">5 часов</span> — практика: этюды, работа в кадре, разбор
              типовых задач для массовки и эпизодических ролей.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>16 часов</CardTitle>
            <CardDescription>Два учебных дня</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">5 часов</span> — теория: углублённый разбор жанров,
              кадра, техники речи и движения.
            </p>
            <p>
              <span className="font-semibold text-foreground">11 часов</span> — практика: сцены, импровизация, разбор
              ошибок, подготовка к реальным кастингам.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-muted/20 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Почему учиться у нас</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          <li>
            <strong className="text-foreground">Государственные стандарты.</strong> Программа выстроена в соответствии с
            требованиями к дополнительному профессиональному образованию; по итогам вы получаете сертификат
            государственного образца.
          </li>
          <li>
            <strong className="text-foreground">Современные методики.</strong> Актуальные упражнения, много практики в
            мини-группах, разбор реальных ситуаций с площадки и кастинга.
          </li>
          <li>
            <strong className="text-foreground">Преподаватели из ведущих вузов.</strong> Опытные педагоги и практикующие
            специалисты индустрии.
          </li>
          <li>
            <strong className="text-foreground">Ориентация на рынок.</strong> Упор на то, что действительно спрашивают
            на кастингах: уверенность, дисциплина, умение быстро включаться в задачу.
          </li>
        </ul>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Заявка на курс</CardTitle>
          <CardDescription>
            Выберите формат (8 или 16 часов) и свободную дату в календаре. Менеджер подтвердит запись и согласует детали.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseLeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
