"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  updateActorProfileAction,
  type ActorProfileUpdateState,
} from "@/features/profile/actions";
import { Button } from "@/components/ui/button";

const initial: ActorProfileUpdateState = {};

export function ActorAnketaSaveForm({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateActorProfileAction, initial);

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
          {pending ? "Сохранение…" : "Сохранить анкету"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => router.push("/actor/profile")}
        >
          Выйти без сохранения
        </Button>
      </div>
    </form>
  );
}
