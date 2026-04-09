"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { persistCookieConsent } from "@/lib/cookie-consent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EntryRole = "ACTOR" | "PRODUCER";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");

  const [step, setStep] = useState<"choose" | "form">("choose");
  const [entryRole, setEntryRole] = useState<EntryRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function pickRole(role: EntryRole) {
    setEntryRole(role);
    setStep("form");
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryRole) return;
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      expectedRole: entryRole,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email, пароль или тип входа не совпадает с аккаунтом");
      return;
    }
    persistCookieConsent();
    const s = await getSession();
    let next = callbackUrl;
    if (!next || next === "/" || next === "/login") {
      next = s?.user.role === "ADMIN" ? "/admin" : "/explore";
    }
    window.location.assign(next);
  }

  return (
    <div className="mx-auto w-full max-w-lg md:max-w-xl">
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            {step === "choose"
              ? "Выберите, в какой кабинет вы входите (как при регистрации)"
              : entryRole === "ACTOR"
                ? "Вход в кабинет актёра"
                : "Вход в кабинет кастинг-директора"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registered && <p className="mb-4 text-sm text-green-700">Регистрация успешна. Войдите.</p>}

          {step === "choose" && (
            <div className="flex flex-col gap-3">
              <Button type="button" className="h-12 w-full" onClick={() => pickRole("ACTOR")}>
                Войти как актёр
              </Button>
              <Button type="button" variant="outline" className="h-12 w-full" onClick={() => pickRole("PRODUCER")}>
                Войти как кастинг-директор
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link href="/register" className="text-primary underline">
                  Регистрация
                </Link>
              </p>
            </div>
          )}

          {step === "form" && entryRole && (
            <form onSubmit={onSubmit} className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-2 w-fit shrink-0 gap-0"
                onClick={() => setStep("choose")}
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
                Другой тип входа
              </Button>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Вход…" : "Войти"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link
                  href={entryRole === "ACTOR" ? "/register/actor" : "/register/producer"}
                  className="text-primary underline"
                >
                  Регистрация
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
