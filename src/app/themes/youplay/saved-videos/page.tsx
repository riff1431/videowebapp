import { requireAuth } from "@/lib/auth/require-auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function SavedVideosPage() {
  const session = await requireAuth("/saved-videos");
  const username = session.user.username || "admin";
  redirect(`/@${username}?page=play-list`);
}
