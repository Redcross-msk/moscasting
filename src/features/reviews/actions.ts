"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createReview } from "@/server/services/review.service";

export async function createReviewAction(applicationId: string, stars: number, text: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Войдите в систему");

  await createReview({
    applicationId,
    authorUserId: session.user.id,
    stars,
    text: text.trim(),
  });

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
  revalidatePath("/admin/reviews");
  revalidatePath("/producer/chats");
  revalidatePath("/actor/chats");
  revalidatePath("/explore");
}
