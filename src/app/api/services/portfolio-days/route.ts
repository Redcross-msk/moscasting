import { NextResponse } from "next/server";
import { listAvailablePortfolioDays } from "@/server/services/portfolio-slot.service";

export async function GET() {
  const days = await listAvailablePortfolioDays();
  return NextResponse.json({
    days: days.map((d) => ({
      id: d.id,
      shootDate: d.shootDate.toISOString().slice(0, 10),
      remaining: d.remaining,
      maxBookings: d.maxBookings,
    })),
  });
}
