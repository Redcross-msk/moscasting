import Link from "next/link";
import type { ActorProfileMessagePayload } from "@/lib/message-payload";
import { russianYearsWord } from "@/lib/utils";

export function ActorProfileSnapshotCard({ data }: { data: ActorProfileMessagePayload }) {
  return (
    <Link
      href={`/actors/${data.actorProfileId}`}
      className="block rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Профиль актёра</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{data.fullName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {data.cityName}
        {data.age > 0 ? ` · ${data.age} ${russianYearsWord(data.age)}` : null}
        {data.heightCm != null && data.heightCm > 0 ? ` · ${data.heightCm} см` : null}
        {data.weightKg != null && data.weightKg > 0 ? ` · ${data.weightKg} кг` : null}
      </p>
      <p className="mt-2 text-xs font-medium text-primary">Открыть витрину профиля →</p>
    </Link>
  );
}
