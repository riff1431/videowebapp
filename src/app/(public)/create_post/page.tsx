import { requireAuth } from "@/lib/auth/require-auth";
import { CreatePostClient } from "./CreatePostClient";

export const metadata = {
  title: "Create Post - PlayTube",
  description: "Share an update or announcement with your community.",
};

export default async function CreatePostPage() {
  await requireAuth("/create_post");
  return <CreatePostClient />;
}
