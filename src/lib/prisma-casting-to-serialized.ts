import type { Casting, CastingCategory, City, ProducerProfile } from "@prisma/client";
import { serializeRoleRequirements } from "@/lib/casting-display";
import type { SerializedHomeCasting } from "@/components/home-public-browse";

type CastingWithCardRelations = Casting & {
  city: City;
  producerProfile: Pick<ProducerProfile, "id" | "companyName" | "fullName">;
};

export function prismaCastingToSerializedHome(c: CastingWithCardRelations): SerializedHomeCasting {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    city: { name: c.city.name },
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    shootStartTime: c.shootStartTime,
    workHoursNote: c.workHoursNote,
    metroOrPlace: c.metroOrPlace,
    castingCategory: c.castingCategory as SerializedHomeCasting["castingCategory"],
    roleRequirements: serializeRoleRequirements(c.roleRequirementsJson, c.castingCategory as CastingCategory | null),
    paymentInfo: c.paymentInfo,
    paymentRub: c.paymentRub,
    createdAt: c.createdAt.toISOString(),
    producerProfile: {
      id: c.producerProfile.id,
      companyName: c.producerProfile.companyName,
      fullName: c.producerProfile.fullName,
    },
    metroStation: c.metroStation,
    addressLine: c.addressLine,
  };
}
