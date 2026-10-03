import sanitizeHtml from "sanitize-html";

/**
 * Default sanitize configuration allowing safe rich-text formatting tags
 * but stripping dangerous tags like <script>, <iframe>, <object>, <embed>,
 * javascript: pseudo-protocols, onerror/onload event handlers, and data: URIs.
 */
export const SAFE_HTML_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "b",
    "i",
    "em",
    "strong",
    "a",
    "ul",
    "ol",
    "li",
    "br",
    "span",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "code",
    "pre",
    "hr",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    span: ["class"],
    p: ["class"],
    code: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
};

/**
 * Strict sanitizer for plain text fields where NO html tags are permitted (e.g. bios, comments)
 */
export const PLAIN_TEXT_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

/**
 * Sanitizes rich-text user content (such as articles or custom formatted user posts)
 */
export function sanitizeUserHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SAFE_HTML_CONFIG).trim();
}

/**
 * Strips all HTML tags and attributes for user content that should be plain text (e.g. bios, comments)
 */
export function sanitizePlainText(text: string): string {
  if (!text) return "";
  return sanitizeHtml(text, PLAIN_TEXT_CONFIG).trim();
}
