"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProducerProfileAction,
  type ProducerProfileUpdateState,
} from "@/features/profile/actions";
import { Button } from "@/components/ui/button";

const initial: ProducerProfileUpdateState = {};

export function ProducerProfileSaveForm({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateProducerProfileAction, initial);

  return (
    <form action={formAction} className="space-y-8">
      {children}
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Сохранение…" : "Сохранить профиль"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => router.push("/producer/profile")}
        >
          Выйти без сохранения
        </Button>
      </div>
    </form>
  );
}
