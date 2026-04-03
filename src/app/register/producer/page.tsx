import { UserRole } from "@prisma/client";
import { env } from "@/lib/env";
import { RegisterForm } from "../register-form";

export default function RegisterProducerPage() {
  return (
    <div className="mx-auto max-w-lg">
      <RegisterForm defaultCitySlug={env.NEXT_PUBLIC_DEFAULT_CITY_SLUG} fixedRole={UserRole.PRODUCER} />
    </div>
  );
}
