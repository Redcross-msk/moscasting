import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { runActorPortfolioPhotosUpload } from "@/server/media/actor-portfolio-photos-upload";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const profile = await prisma.actorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Нет профиля" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];

  if (process.env.NODE_ENV === "development") {
    console.log("[api /actor/portfolio-photos] POST, файлов:", files.length);
  }

  const outcome = await runActorPortfolioPhotosUpload(profile.id, files);

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }

  return NextResponse.json({ added: outcome.added });
}
