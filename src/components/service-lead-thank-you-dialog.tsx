"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ServiceLeadThankYouDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const authed = Boolean(session?.user);
  const href = authed ? "/explore" : "/login";
  const label = authed ? "Перейти в каталог" : "На страницу входа";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Спасибо за заявку!</DialogTitle>
          <DialogDescription>
            Наши менеджеры свяжутся с вами в ближайшее время.
          </DialogDescription>
        </DialogHeader>
        <Button asChild className="w-full sm:w-auto">
          <Link href={href}>{label}</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
