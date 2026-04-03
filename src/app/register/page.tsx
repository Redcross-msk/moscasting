import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterChoosePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-primary">Регистрация</h1>
      <p className="text-sm text-muted-foreground">Выберите тип аккаунта</p>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Актёр</CardTitle>
            <CardDescription>Массовка, второй план, эпизодические роли</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register/actor">
              <Button className="w-full">Создать аккаунт актёра</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Кастинг-директор / продюсер</CardTitle>
            <CardDescription>Публикация кастингов и отбор кандидатов</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register/producer">
              <Button className="w-full" variant="secondary">
                Создать аккаунт кастинг-директора
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-primary underline">
          Вход
        </Link>
      </p>
    </div>
  );
}
