import { redirect } from "next/navigation";

export default function ProducerDashboardRedirect() {
  redirect("/producer/profile");
}
