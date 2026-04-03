import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { runProducerPortfolioPhotosUpload } from "@/server/media/producer-portfolio-photos-upload";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const profile = await prisma.producerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Нет профиля" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];

  const outcome = await runProducerPortfolioPhotosUpload(profile.id, files);

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }

  return NextResponse.json({ added: outcome.added });
}
