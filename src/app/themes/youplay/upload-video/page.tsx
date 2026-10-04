import { requireAuth } from "@/lib/auth/require-auth";
import UploadVideoClient from "./UploadVideoClient";
import { getUserUploadLimit } from "@/lib/config/upload-policy";
import { notFound } from "next/navigation";

export default async function UploadVideoPage() {
  const session = await requireAuth("/upload-video");
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const policy = await getUserUploadLimit(userId);

  if (!policy.canUpload) {
    notFound();
  }

  return <UploadVideoClient policy={policy} />;
}
