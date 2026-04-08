"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createReview } from "@/server/services/review.service";

export type CreateReviewResult = { ok: true } | { ok: false; error: string };

export async function createReviewAction(
  applicationId: string,
  stars: number,
  text: string,
): Promise<CreateReviewResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Войдите в систему" };
  }

  try {
    await createReview({
      applicationId,
      authorUserId: session.user.id,
      stars,
      text: (text ?? "").trim(),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось сохранить оценку" };
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { producerProfileId: true, actorProfileId: true },
  });
  if (app) {
    revalidatePath(`/producers/${app.producerProfileId}`);
    revalidatePath(`/actors/${app.actorProfileId}`);
  }

  revalidatePath("/actor/applications");
  revalidatePath("/producer/castings");
  revalidatePath("/producer/profile");
  revalidatePath("/producer/chats");
  revalidatePath("/actor/chats");
  revalidatePath("/explore");

  return { ok: true };
}
