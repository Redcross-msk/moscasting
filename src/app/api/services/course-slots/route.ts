import { NextResponse } from "next/server";
import { CourseSlotType } from "@prisma/client";
import { listAvailableCourseSlots } from "@/server/services/course-slot.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t = searchParams.get("type");
  if (t !== "EIGHT_HOURS" && t !== "SIXTEEN_HOURS") {
    return NextResponse.json({ error: "type must be EIGHT_HOURS or SIXTEEN_HOURS" }, { status: 400 });
  }
  const slots = await listAvailableCourseSlots(t as CourseSlotType);
  return NextResponse.json({
    slots: slots.map((s) => ({
      id: s.id,
      type: s.type,
      startDay: s.startDay.toISOString().slice(0, 10),
      secondDay: s.secondDay ? s.secondDay.toISOString().slice(0, 10) : null,
      remaining: s.remaining,
      maxParticipants: s.maxParticipants,
    })),
  });
}
