"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function FormSubmitOnceButton({
  children,
  className,
  size,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} size={size} variant={variant}>
      {pending ? "Отправка…" : children}
    </Button>
  );
}
