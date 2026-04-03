"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CastingSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const submit = useCallback(
    (q: string) => {
      start(() => {
        const p = new URLSearchParams(params.toString());
        p.set("tab", "castings");
        if (q) p.set("q", q);
        else p.delete("q");
        router.push(`/explore?${p.toString()}`);
      });
    },
    [router, params],
  );

  return (
    <form
      className="flex max-w-xl gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit(String(fd.get("q") ?? ""));
      }}
    >
      <Input name="q" placeholder="Поиск по названию" defaultValue={initial} />
      <Button type="submit" disabled={pending}>
        Найти
      </Button>
    </form>
  );
}
