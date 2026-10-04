import { redirect } from "next/navigation";

export default function ManageVideosPage() {
  redirect("/dashboard?tab=videos");
}
