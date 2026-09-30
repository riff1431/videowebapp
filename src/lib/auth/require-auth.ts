import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth(returnUrl?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    if (returnUrl) {
      redirect(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      redirect("/login");
    }
  }

  return session;
}
