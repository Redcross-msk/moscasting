import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { runActorPortfolioVideoUpload } from "@/server/media/actor-portfolio-video-upload";

export const dynamic = "force-dynamic";

/** Загрузка видеовизитки через Route Handler: на мобильных надёжнее, чем большой Server Action. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const profile = await prisma.actorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Нет профиля" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать форму (слишком большой файл или обрыв связи)" },
      { status: 400 },
    );
  }

  const file = formData.get("video");
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "Выберите видео" }, { status: 400 });
  }

  try {
    const out = await runActorPortfolioVideoUpload(profile.id, file);
    if ("error" in out) {
      return NextResponse.json({ error: out.error }, { status: 400 });
    }
    return NextResponse.json({ publicUrl: out.publicUrl, storageKey: out.storageKey });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить видео" }, { status: 500 });
  }
}
