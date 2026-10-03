import { getSiteConfig } from "@/lib/config";

/**
 * Returns a censor mask replacement of any forbidden words configured in admin settings.
 * Replaces censored words with '***'. Case-insensitive.
 */
export async function censorText(text: string): Promise<string> {
  if (!text) return "";

  const config = await getSiteConfig(["censored_words"]);
  const rawWords = config["censored_words"]?.trim();
  if (!rawWords) return text;

  const words = rawWords
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  if (words.length === 0) return text;

  let result = text;
  for (const word of words) {
    // Escape special regex characters in word
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, "***");
  }

  return result;
}
