import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { PortfolioLeadForm } from "@/components/portfolio-lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Портфолио и видеовизитка — МОСКАСТИНГ",
  description: "Профессиональное фото- и видеопортфолио для актёров в стандартизированном формате.",
};

export default async function PortfolioServicePage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-primary">Портфолио и видеовизитка</h1>
        <p className="text-lg text-muted-foreground">
          Сильные материалы для кастинг-директоров и агентств: чистая подача, ровный свет, аккуратный монтаж — без
          «домашних» снимков на телефон.
        </p>
      </header>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Фотопортфолио</CardTitle>
            <CardDescription>Образы, которые работают на вас</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            <p>
              Снимаем портретные серии и кадры в полный рост с учётом требований индустрии: нейтральный и драматический
              свет,
              разные ракурсы, акцент на взгляде и пластике. Помогаем с позированием, чтобы кадры выглядели живыми, а не
              «натянутыми».
            </p>
            <p>
              Итог — подборка кадров, которую не стыдно приложить к отклику и показать на очном кастинге. При
              необходимости подготовим несколько визуальных образов под разные типы ролей.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Видеовизитка</CardTitle>
            <CardDescription>Коротко о вас на камеру — по правилам площадки</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            <p>
              Видеовизитка — это ваш «визит в кадре»: имя, рост и параметры по запросу, короткая самопрезентация и
              фрагменты игры. Такой ролик часто просят до очного просмотра; от качества звука и картинки зависит первое
              впечатление.
            </p>
            <p>
              Мы снимаем и монтируем материал в стандартизированном формате подачи: читаемый звук, стабильный кадр,
              динамичный, но не перегруженный монтаж. Вы получаете файл, готовый к загрузке на платформу или отправке
              кастинг-директору.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Внутренние стандарты качества и сервис</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Работаем прозрачно: фиксируем договорённости по срокам и формату в соответствии с внутренними требованиями
          платформы, соблюдаем требования к персональным данным.
          Команда — фотографы, операторы и продюсеры с опытом работы с актёрами; задача — чтобы вы ушли со съёмки с
          материалом, который реально помогает продвигаться.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Заявка на съёмку</CardTitle>
          <CardDescription>
            Выберите удобную дату из открытых слотов. Менеджер свяжется с вами и уточнит детали и состав пакета.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioLeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
