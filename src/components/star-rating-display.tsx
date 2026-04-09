function ratingCountLabelRu(count: number) {
  const n = count % 100;
  if (n >= 11 && n <= 14) return `${count} оценок`;
  const k = count % 10;
  if (k === 1) return `${count} оценка`;
  if (k >= 2 && k <= 4) return `${count} оценки`;
  return `${count} оценок`;
}

export function StarRatingDisplay({
  average,
  count,
  size = "md",
}: {
  average: number;
  count: number;
  size?: "sm" | "md" | "lg";
}) {
  const full = Math.round(average);
  const starClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-3xl leading-none tracking-tight sm:text-4xl" : "text-lg";
  const captionClass = size === "lg" ? "text-sm sm:text-base" : "text-sm";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <span className={`text-amber-500 ${starClass}`} aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= full ? "★" : "☆"}</span>
        ))}
      </span>
      <span className={`text-muted-foreground ${captionClass}`}>
        {average.toFixed(1)} · {ratingCountLabelRu(count)}
      </span>
    </div>
  );
}
