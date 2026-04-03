import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-primary">Страница не найдена</h1>
      <p className="max-w-md text-sm text-muted-foreground">Проверьте адрес или вернитесь на главную.</p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
