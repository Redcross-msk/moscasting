import { redirect } from "next/navigation";

export default function AdminActorsRedirectPage() {
  redirect("/admin/users?tab=actors");
}
