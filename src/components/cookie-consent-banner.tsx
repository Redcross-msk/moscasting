"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { persistCookieConsent, readCookieConsent } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setReady(true);
    setOpen(!readCookieConsent());
  }, []);

  if (!ready || !open) return null;

  function onAccept() {
    persistCookieConsent();
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
      role="dialog"
      aria-label="Согласие на использование cookie"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Файлы cookie и конфиденциальность</p>
          <p>
            Мы используем необходимые cookie для входа и работы сайта. Продолжая пользоваться МОСКАСТИНГ, вы
            соглашаетесь с{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-2">
              политикой конфиденциальности
            </Link>{" "}
            и{" "}
            <Link href="/cookies" className="text-primary underline underline-offset-2">
              информацией о cookie
            </Link>
            .
          </p>
          <div className="flex items-start gap-2 pt-1">
            <input
              id="cookie-consent-check"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
            />
            <Label htmlFor="cookie-consent-check" className="cursor-pointer font-normal leading-snug">
              Я прочитал(а) и принимаю политику конфиденциальности и использование файлов cookie
            </Label>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" disabled={!checked} className="w-full sm:w-auto" onClick={onAccept}>
            Принять и продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
