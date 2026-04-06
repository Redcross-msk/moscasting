import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HomePublicBrowse, type SerializedHomeActor } from "@/components/home-public-browse";
import { getHomepageActors, getHomepageCastings } from "@/server/services/homepage.service";
import { env } from "@/lib/env";
import { auth } from "@/auth";
import { professionalSkillLabel } from "@/lib/actor-form-constants";
import { serializeCastingForBrowse } from "@/lib/serialize-casting-browse";

function serializeActors(rows: Awaited<ReturnType<typeof getHomepageActors>>): SerializedHomeActor[] {
  return rows.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    birthDate: a.birthDate.toISOString(),
    city: { name: a.city.name },
    avatarUrl: a.media[0]?.publicUrl?.trim() ?? null,
    heightCm: a.heightCm,
    weightKg: a.weightKg,
    professionalLabels: a.professionalSkillKeys.map(
      (slug) => professionalSkillLabel[slug as keyof typeof professionalSkillLabel] ?? slug,
    ),
  }));
}

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/explore");

  const city = env.NEXT_PUBLIC_DEFAULT_CITY_SLUG;
  const [castings, actors] = await Promise.all([getHomepageCastings(city), getHomepageActors(city)]);

  return (
    <div className="min-w-0 space-y-8 pb-10 sm:space-y-10 sm:pb-12">
      <section className="rounded-xl border border-border bg-gradient-to-br from-primary/[0.06] to-background px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">МОСКАСТИНГ</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          Кастинги и актёры в Москве: актёры первого и второго плана, актёры главных и эпизодических ролей, актёры
          массовки и групповки, а также каскадёры и дублёры! Ниже предоставлены все актуальные кастинги в городе Москве
          и Московской области — ТВ, клипов, шоу, сериалов, любительского и профессионального кино и интернет-платформ!
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/register/actor">
            <Button size="lg" className="h-11 w-full min-w-[220px] px-6 sm:w-auto">
              Создать аккаунт актёра
            </Button>
          </Link>
          <Link href="/register/producer">
            <Button size="lg" variant="outline" className="h-11 w-full min-w-[260px] border-primary/40 px-6 sm:w-auto">
              Создать аккаунт кастинг-директора
            </Button>
          </Link>
        </div>
      </section>

      <HomePublicBrowse
        castings={castings.map((c) => serializeCastingForBrowse(c))}
        actors={serializeActors(actors)}
        activeTab="both"
      />
    </div>
  );
}
