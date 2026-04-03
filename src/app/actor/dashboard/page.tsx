import { redirect } from "next/navigation";

export default function ActorDashboardRedirect() {
  redirect("/actor/profile");
}
