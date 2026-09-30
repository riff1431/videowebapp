import { requireAuth } from "@/lib/auth/require-auth";
import CreateArticleClient from "./CreateArticleClient";

export default async function CreateArticlePage() {
  await requireAuth("/create-article");
  return <CreateArticleClient />;
}
