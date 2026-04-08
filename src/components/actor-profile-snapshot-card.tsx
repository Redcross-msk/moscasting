import Link from "next/link";
import { User } from "lucide-react";
import type { ActorProfileMessagePayload } from "@/lib/message-payload";
import { cn, formatActorSurnameAndFirstName, russianYearsWord } from "@/lib/utils";

export function ActorProfileSnapshotCard({ data }: { data: ActorProfileMessagePayload }) {
  const displayName = formatActorSurnameAndFirstName(data.fullName);
  const url = data.avatarUrl?.trim();

  return (
    <Link
      href={`/actors/${data.actorProfileId}`}
      className="block rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex flex-row gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Профиль актёра</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{displayName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.cityName}
            {data.age > 0 ? ` · ${data.age} ${russianYearsWord(data.age)}` : null}
            {data.heightCm != null && data.heightCm > 0 ? ` · ${data.heightCm} см` : null}
            {data.weightKg != null && data.weightKg > 0 ? ` · ${data.weightKg} кг` : null}
          </p>
          <p className="mt-2 text-xs font-medium text-primary">Открыть витрину профиля →</p>
        </div>
        <div
          className={cn(
            "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted",
            "sm:h-[4.5rem] sm:w-[4.5rem]",
          )}
          aria-hidden
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <User className="h-8 w-8 opacity-40" strokeWidth={1.25} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
