import { requireAuth } from "@/lib/auth/require-auth";
import UploadVideoClient from "./UploadVideoClient";

export default async function UploadVideoPage() {
  await requireAuth("/upload-video");
  return <UploadVideoClient />;
}
