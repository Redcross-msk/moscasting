import { UserRole } from "@prisma/client";
import { env } from "@/lib/env";
import { RegisterForm } from "../register-form";

export default function RegisterActorPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <RegisterForm defaultCitySlug={env.NEXT_PUBLIC_DEFAULT_CITY_SLUG} fixedRole={UserRole.ACTOR} />
    </div>
  );
}
