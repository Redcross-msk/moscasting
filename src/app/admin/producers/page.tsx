import { redirect } from "next/navigation";

export default function AdminProducersRedirectPage() {
  redirect("/admin/users?tab=producers");
}
