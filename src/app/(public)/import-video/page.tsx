import { requireAuth } from "@/lib/auth/require-auth";
import ImportVideoClient from "./ImportVideoClient";

export default async function ImportVideoPage() {
  await requireAuth("/import-video");
  return <ImportVideoClient />;
}
