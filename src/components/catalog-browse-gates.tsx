"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GatedCastingLink({
  castingId,
  className,
  children,
}: {
  castingId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const canBrowse = status === "authenticated";
  const loading = status === "loading";

  if (loading) {
    return (
      <div className={`cursor-wait opacity-80 ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  if (canBrowse) {
    return (
      <Link href={`/castings/${castingId}`} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`block w-full text-left ${className ?? ""}`}>
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Кастинги</DialogTitle>
            <DialogDescription>
              Чтобы открыть карточку кастинга, войдите или зарегистрируйтесь как актёр.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/actor">Регистрация актёра</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GatedActorLink({
  actorProfileId,
  className,
  children,
}: {
  actorProfileId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const role = session?.user?.role;
  const canBrowse =
    status === "authenticated" &&
    (role === "ACTOR" || role === "PRODUCER" || role === "ADMIN");
  const loading = status === "loading";

  if (loading) {
    return (
      <div className={`cursor-wait opacity-80 ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  if (canBrowse) {
    return (
      <Link href={`/actors/${actorProfileId}`} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`block w-full text-left ${className ?? ""}`}>
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Актёры</DialogTitle>
            <DialogDescription>
              Войдите как актёр или кастинг-директор, чтобы открыть профиль.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/actor">Регистрация актёра</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/producer">Регистрация кастинг-директора</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
