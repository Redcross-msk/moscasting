"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { registerUser, type RegisterState } from "@/features/auth/register-action";
import { persistCookieConsent } from "@/lib/cookie-consent";
import { ActorAnketaFields } from "@/components/actor-anketa-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: RegisterState = {};

export function RegisterForm({
  defaultCitySlug,
  fixedRole,
}: {
  defaultCitySlug: string;
  /** Если задано — отдельная регистрация актёра или продюсера, без выбора роли */
  fixedRole?: UserRole;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(fixedRole ?? UserRole.ACTOR);
  const [state, formAction, pending] = useActionState(registerUser, initial);

  useEffect(() => {
    if (state.ok) {
      persistCookieConsent();
      router.push("/login?registered=1");
    }
  }, [state.ok, router]);

  const title =
    fixedRole === UserRole.ACTOR
      ? "Регистрация актёра"
      : fixedRole === UserRole.PRODUCER
        ? "Регистрация кастинг-директора"
        : "Регистрация";
  const description =
    fixedRole === UserRole.ACTOR
      ? "Заполните анкету актёра, массовки или второго плана"
      : fixedRole === UserRole.PRODUCER
        ? "Заполните данные продюсера или кастинг-директора"
        : "Выберите роль и заполните профиль";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="citySlug" value={defaultCitySlug} />
          <input type="hidden" name="role" value={role} />

          {!fixedRole && (
            <div className="space-y-2">
              <Label>Роль</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={UserRole.ACTOR}>Актёр / массовка / второй план</option>
                <option value={UserRole.PRODUCER}>Продюсер / кастинг-директор</option>
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль (мин. 8)</Label>
              <Input id="password" name="password" type="password" required autoComplete="new-password" />
            </div>
          </div>

          {role === UserRole.ACTOR ? (
            <div className="rounded-xl border border-border bg-muted/20 p-4 md:p-6">
              <ActorAnketaFields />
            </div>
          ) : (
            <ProducerFields />
          )}

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <input
              id="acceptLegal"
              name="acceptLegal"
              type="checkbox"
              value="on"
              required
              className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
            />
            <label htmlFor="acceptLegal" className="cursor-pointer text-sm leading-snug text-muted-foreground">
              Я принимаю{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2">
                политику конфиденциальности
              </Link>
              ,{" "}
              <Link href="/terms" className="text-primary underline underline-offset-2">
                пользовательское соглашение
              </Link>{" "}
              и использование{" "}
              <Link href="/cookies" className="text-primary underline underline-offset-2">
                файлов cookie
              </Link>{" "}
              (включая необходимые cookie для входа).
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Регистрация…" : "Зарегистрироваться"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary underline">
              Вход
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function ProducerFields() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-sm font-medium">Профиль продюсера</p>
      <div className="space-y-2">
        <Label htmlFor="fullName">ФИО</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Компания</Label>
        <Input id="companyName" name="companyName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="positionTitle">Должность</Label>
        <Input id="positionTitle" name="positionTitle" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filmography">Фильмография</Label>
        <Textarea id="filmography" name="filmography" />
      </div>
    </div>
  );
}
