"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/server/services/notification.service";

export async function markNotificationReadFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Forbidden");
  const id = String(formData.get("notificationId") ?? "");
  if (!id) throw new Error("Нет id");
  await markNotificationRead(session.user.id, id);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Forbidden");
  await markAllNotificationsRead(session.user.id);
  revalidatePath("/notifications");
}
