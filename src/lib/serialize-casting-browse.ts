import type { CastingCategory } from "@prisma/client";
import type { SerializedHomeCasting } from "@/components/home-public-browse";
import { serializeRoleRequirements } from "@/lib/casting-display";

type CastingBrowseRow = {
  id: string;
  title: string;
  description: string;
  city: { name: string };
  scheduledAt: Date | null;
  shootStartTime: string | null;
  workHoursNote: string | null;
  metroOrPlace: string | null;
  metroStation: string | null;
  addressLine: string | null;
  castingCategory: CastingCategory | null;
  roleRequirementsJson: unknown;
  paymentInfo: string | null;
  paymentRub: number | null;
  createdAt: Date;
  producerProfile: { id: string; companyName: string; fullName: string };
};

export function serializeCastingForBrowse(
  c: CastingBrowseRow,
  extras?: { myApplicationChatId?: string | null; isFavorite?: boolean },
): SerializedHomeCasting {
  const cat = c.castingCategory;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    city: { name: c.city.name },
    scheduledAt: c.scheduledAt?.toISOString() ?? null,
    shootStartTime: c.shootStartTime?.trim() ?? null,
    workHoursNote: c.workHoursNote?.trim() ?? null,
    metroOrPlace: c.metroOrPlace?.trim() ?? null,
    metroStation: c.metroStation?.trim() ?? null,
    addressLine: c.addressLine?.trim() ?? null,
    castingCategory: cat === "MASS" || cat === "GROUP" || cat === "SOLO" ? cat : null,
    roleRequirements: serializeRoleRequirements(c.roleRequirementsJson, cat),
    paymentInfo: c.paymentInfo,
    paymentRub: c.paymentRub ?? null,
    createdAt: c.createdAt.toISOString(),
    producerProfile: {
      id: c.producerProfile.id,
      companyName: c.producerProfile.companyName,
      fullName: c.producerProfile.fullName,
    },
    myApplicationChatId: extras?.myApplicationChatId ?? null,
    isFavorite: extras?.isFavorite ?? false,
  };
}
