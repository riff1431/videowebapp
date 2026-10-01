"use server";

import { db } from "@/db";
import { customPages, faqs, termsPages, languages, siteConfig } from "@/db/schema";
import { eq, inArray, ilike, or, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Custom Pages Actions
// ==========================================

export interface CustomPageItem {
  id: number;
  pageName: string;
  pageTitle: string;
  pageContent: string;
  pageType: number;
  createdAt: Date;
}

export async function getCustomPagesAction(query = "", sort = "DESC_i"): Promise<CustomPageItem[]> {
  try {
    let qb = db.select().from(customPages);

    let whereClause = undefined;
    if (query.trim()) {
      const searchPattern = `%${query.trim()}%`;
      whereClause = or(
        ilike(customPages.pageName, searchPattern),
        ilike(customPages.pageTitle, searchPattern),
        ilike(customPages.pageContent, searchPattern)
      );
    }

    let orderByClause = desc(customPages.id);
    if (sort === "ASC_i") orderByClause = asc(customPages.id);
    else if (sort === "DESC_i") orderByClause = desc(customPages.id);
    else if (sort === "ASC_n") orderByClause = asc(customPages.pageName);
    else if (sort === "DESC_n") orderByClause = desc(customPages.pageName);
    else if (sort === "ASC_t") orderByClause = asc(customPages.pageTitle);
    else if (sort === "DESC_t") orderByClause = desc(customPages.pageTitle);

    if (whereClause) {
      return await qb.where(whereClause).orderBy(orderByClause);
    }
    return await qb.orderBy(orderByClause);
  } catch (err) {
    console.error("Failed to load custom pages:", err);
    return [];
  }
}

export async function getCustomPageByNameAction(name: string): Promise<CustomPageItem | null> {
  try {
    const rows = await db
      .select()
      .from(customPages)
      .where(eq(customPages.pageName, name))
      .limit(1);
    return rows[0] || null;
  } catch (err) {
    console.error("Failed to load custom page:", err);
    return null;
  }
}

export async function createCustomPageAction(data: {
  pageName: string;
  pageTitle: string;
  pageContent: string;
  pageType: number;
}) {
  try {
    const pageName = data.pageName?.trim();
    const pageTitle = data.pageTitle?.trim();
    const pageContent = data.pageContent?.trim();
    const pageType = Number(data.pageType) === 0 ? 0 : 1;

    if (!pageName || !pageTitle || !pageContent) {
      return { success: false, error: "Please fill all the required fields" };
    }

    if (!/^[\w]+$/.test(pageName)) {
      return {
        success: false,
        error: "Invalid page name characters. Use letters, numbers, and underscores only.",
      };
    }

    // Check unique page_name
    const existing = await db
      .select()
      .from(customPages)
      .where(eq(customPages.pageName, pageName))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "A custom page with this name already exists" };
    }

    await db.insert(customPages).values({
      pageName,
      pageTitle,
      pageContent,
      pageType,
    });

    revalidatePath("/admin/manage-custom-pages");
    revalidatePath(`/site-pages/${pageName}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error creating custom page:", err);
    return { success: false, error: err.message || "Failed to create page" };
  }
}

export async function editCustomPageAction(data: {
  id: number;
  pageName: string;
  pageTitle: string;
  pageContent: string;
  pageType: number;
}) {
  try {
    const pageName = data.pageName?.trim();
    const pageTitle = data.pageTitle?.trim();
    const pageContent = data.pageContent?.trim();
    const pageType = Number(data.pageType) === 0 ? 0 : 1;

    if (!data.id || !pageName || !pageTitle || !pageContent) {
      return { success: false, error: "Please fill all the required fields" };
    }

    if (!/^[\w]+$/.test(pageName)) {
      return {
        success: false,
        error: "Invalid page name characters. Use letters, numbers, and underscores only.",
      };
    }

    await db
      .update(customPages)
      .set({
        pageName,
        pageTitle,
        pageContent,
        pageType,
      })
      .where(eq(customPages.id, data.id));

    revalidatePath("/admin/manage-custom-pages");
    revalidatePath(`/site-pages/${pageName}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error editing custom page:", err);
    return { success: false, error: err.message || "Failed to edit page" };
  }
}

export async function deleteCustomPageAction(id: number) {
  try {
    await db.delete(customPages).where(eq(customPages.id, id));
    revalidatePath("/admin/manage-custom-pages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete page" };
  }
}

export async function deleteMultipleCustomPagesAction(ids: number[]) {
  try {
    if (ids.length > 0) {
      await db.delete(customPages).where(inArray(customPages.id, ids));
    }
    revalidatePath("/admin/manage-custom-pages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete selected pages" };
  }
}

// ==========================================
// 2. Terms Pages Actions (Terms of Use, Privacy, About, Refund)
// ==========================================

export interface TermsPageData {
  type: string;
  name: string;
  enabled: boolean;
  translations: Record<string, string>;
}

const TERMS_KEYS: { type: string; name: string }[] = [
  { type: "terms_of_use_page", name: "Terms of Use" },
  { type: "privacy_policy_page", name: "Privacy Policy" },
  { type: "about_page", name: "About" },
  { type: "refund_terms_page", name: "Refund" },
];

export async function getTermsPagesListAction(): Promise<{ type: string; name: string; enabled: boolean }[]> {
  try {
    const rows = await db.select().from(termsPages);
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.type, r.enabled));

    return TERMS_KEYS.map((k) => ({
      type: k.type,
      name: k.name,
      enabled: map.has(k.type) ? map.get(k.type) === 1 : true,
    }));
  } catch (err) {
    console.error("Failed to load terms pages list:", err);
    return TERMS_KEYS.map((k) => ({ type: k.type, name: k.name, enabled: true }));
  }
}

export async function toggleTermsStatusAction(type: string, enabled: boolean) {
  try {
    const val = enabled ? 1 : 0;
    const existing = await db.select().from(termsPages).where(eq(termsPages.type, type)).limit(1);

    if (existing.length > 0) {
      await db.update(termsPages).set({ enabled: val, updatedAt: new Date() }).where(eq(termsPages.type, type));
    } else {
      await db.insert(termsPages).values({
        type,
        enabled: val,
        translations: "{}",
      });
    }

    revalidatePath("/admin/manage-pages");
    revalidatePath("/terms");
    return { success: true, enabled };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update page status" };
  }
}

export async function getTermsPageByTypeAction(type: string): Promise<{
  type: string;
  name: string;
  translations: Record<string, string>;
  availableLanguages: { id: number; name: string; iso: string }[];
}> {
  // Fetch dynamic languages from database
  let availableLanguages: { id: number; name: string; iso: string }[] = [];
  try {
    const langs = await db.select().from(languages).orderBy(asc(languages.id));
    availableLanguages = langs.map((l) => ({ id: l.id, name: l.name, iso: l.iso }));
  } catch {
    availableLanguages = [{ id: 1, name: "English", iso: "en" }];
  }

  if (availableLanguages.length === 0) {
    availableLanguages = [{ id: 1, name: "English", iso: "en" }];
  }

  let translations: Record<string, string> = {};
  const meta = TERMS_KEYS.find((k) => k.type === type) || { type, name: type };

  try {
    const row = await db.select().from(termsPages).where(eq(termsPages.type, type)).limit(1);
    if (row.length > 0 && row[0].translations) {
      translations = JSON.parse(row[0].translations);
    }
  } catch (err) {
    console.error("Failed to parse translations:", err);
  }

  return {
    type,
    name: meta.name,
    translations,
    availableLanguages,
  };
}

export async function saveTermsPageAction(type: string, translations: Record<string, string>) {
  try {
    const transJson = JSON.stringify(translations);
    const existing = await db.select().from(termsPages).where(eq(termsPages.type, type)).limit(1);

    if (existing.length > 0) {
      await db
        .update(termsPages)
        .set({
          translations: transJson,
          updatedAt: new Date(),
        })
        .where(eq(termsPages.type, type));
    } else {
      await db.insert(termsPages).values({
        type,
        enabled: 1,
        translations: transJson,
      });
    }

    revalidatePath("/admin/manage-pages");
    revalidatePath("/admin/edit-terms-pages");
    revalidatePath("/terms");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save terms page" };
  }
}

// ==========================================
// 3. FAQ Actions
// ==========================================

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  time: Date;
}

export async function getFaqsAction(): Promise<FaqItem[]> {
  try {
    return await db.select().from(faqs).orderBy(desc(faqs.id));
  } catch (err) {
    console.error("Failed to fetch FAQs:", err);
    return [];
  }
}

export async function createFaqAction(question: string, answer: string) {
  try {
    const q = question?.trim();
    const a = answer?.trim();
    if (!q || !a) {
      return { success: false, error: "Please enter both question and answer" };
    }

    const res = await db.insert(faqs).values({
      question: q,
      answer: a,
    }).returning();

    revalidatePath("/admin/manage-faqs");
    revalidatePath("/help/faqs");
    revalidatePath("/terms/faqs");
    return { success: true, faq: res[0] };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create FAQ" };
  }
}

export async function deleteFaqAction(id: number) {
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidatePath("/admin/manage-faqs");
    revalidatePath("/help/faqs");
    revalidatePath("/terms/faqs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete FAQ" };
  }
}

// ==========================================
// 4. Pages SEO Actions
// ==========================================

export interface PageSeoItem {
  key: string;
  name: string;
  title: string;
  metaKeywords: string;
  metaDescription: string;
}

// Full PlayTube SEO page keys catalogue (derived from PlayTube SQL backup config.seo)
const DEFAULT_SEO_PAGES: Record<string, { title: string; meta_keywords: string; meta_description: string }> = {
  "404": { title: "404 - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "ads": { title: "{LANG_KEY ads} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "ads_analytics": { title: "{LANG_KEY ads_analytics} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "age_block": { title: "{LANG_KEY age_block_text} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "articles": { title: "{LANG_KEY articles} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "comments": { title: "{LANG_KEY comments} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "confirm": { title: "{SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "contact": { title: "{LANG_KEY contact_us} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "create_ads": { title: "{SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "create_article": { title: "{LANG_KEY create_article} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "create_post": { title: "{LANG_KEY create_post} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "dashboard": { title: "{LANG_KEY dashboard} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "edit-video": { title: "{LANG_KEY edit_video} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "edit_activity": { title: "{LANG_KEY edit_activity} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "edit_ads": { title: "Edit Ad - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "edit_articles": { title: "{LANG_KEY edit_article} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "forgot_password": { title: "{LANG_KEY reset_password} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "go_pro": { title: "{LANG_KEY go_pro} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "history": { title: "{LANG_KEY history} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "home": { title: "{SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "import-video": { title: "{LANG_KEY import_new_video} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "liked-videos": { title: "{LANG_KEY liked_videos} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "live": { title: "{LANG_KEY live} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "login": { title: "{LANG_KEY login} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "maintenance": { title: "Maintenance - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "manage-videos": { title: "{LANG_KEY manage_videos} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "messages": { title: "{LANG_KEY messages} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "movies": { title: "{LANG_KEY movies} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "my_articles": { title: "{LANG_KEY my_articles} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "paid-videos": { title: "{LANG_KEY paid_videos} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "popular_channels": { title: "{LANG_KEY popular_channels} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "register": { title: "{LANG_KEY register} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "reset-password": { title: "{LANG_KEY change_password} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "saved-videos": { title: "{LANG_KEY history} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "search": { title: "{LANG_KEY search} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "settings": { title: "{LANG_KEY settings} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "subscriptions": { title: "{LANG_KEY subscriptions} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "transactions": { title: "{LANG_KEY earnings} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "upload-video": { title: "{LANG_KEY upload} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
  "video_studio": { title: "{LANG_KEY video_studio} - {SITE_TITLE}", meta_keywords: "{SITE_KEYWORDS}", meta_description: "{SITE_DESC}" },
};

export async function getPagesSeoAction(): Promise<PageSeoItem[]> {
  let seoMap = { ...DEFAULT_SEO_PAGES };

  try {
    const configRow = await db.select().from(siteConfig).where(eq(siteConfig.name, "seo")).limit(1);
    if (configRow.length > 0 && configRow[0].value) {
      const parsed = JSON.parse(configRow[0].value);
      seoMap = { ...seoMap, ...parsed };
    }
  } catch (err) {
    console.error("Failed to read seo config:", err);
  }

  return Object.keys(seoMap).map((key) => {
    const item = seoMap[key];
    const displayName = key.toUpperCase().replace(/[-_]/g, " ");
    return {
      key,
      name: displayName,
      title: item.title || "",
      metaKeywords: item.meta_keywords || "",
      metaDescription: item.meta_description || "",
    };
  });
}

export async function updatePageSeoAction(data: {
  pageName: string;
  title: string;
  metaKeywords: string;
  metaDescription: string;
}) {
  try {
    let currentMap: Record<string, any> = { ...DEFAULT_SEO_PAGES };

    const configRow = await db.select().from(siteConfig).where(eq(siteConfig.name, "seo")).limit(1);
    if (configRow.length > 0 && configRow[0].value) {
      try {
        currentMap = { ...currentMap, ...JSON.parse(configRow[0].value) };
      } catch {}
    }

    currentMap[data.pageName] = {
      title: data.title,
      meta_keywords: data.metaKeywords,
      meta_description: data.metaDescription,
    };

    const serialized = JSON.stringify(currentMap);

    if (configRow.length > 0) {
      await db.update(siteConfig).set({ value: serialized }).where(eq(siteConfig.name, "seo"));
    } else {
      await db.insert(siteConfig).values({ name: "seo", value: serialized });
    }

    revalidatePath("/admin/seo");
    return { success: true, pageName: data.pageName };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update SEO" };
  }
}
