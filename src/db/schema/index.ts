import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// ==========================================
// Better Auth Core Schema (Huipper Standard)
// ==========================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  displayUsername: varchar("display_username", { length: 255 }),
  image: varchar("image", { length: 500 }),
  avatar: varchar("avatar", { length: 500 }).default("/upload/photos/d-avatar.jpg"),
  cover: varchar("cover", { length: 500 }).default("/upload/photos/d-cover.jpg"),
  password: text("password"),
  role: varchar("role", { length: 50 }).default("user"), // user, admin
  isAdmin: boolean("is_admin").default(false),
  wallet: doublePrecision("wallet").default(0),
  balance: doublePrecision("balance").default(0),
  about: text("about"),
  gender: varchar("gender", { length: 20 }).default("male"),
  countryId: integer("country_id").default(0),
  age: integer("age").default(0),
  verified: boolean("verified").default(false),
  isPro: boolean("is_pro").default(false),
  active: boolean("active").default(true),
  google: varchar("google", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// Videos & Categories Schema (PlayTube Parity)
// ==========================================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
  translations: text("translations").default("{}"), // JSON string of { english: "...", arabic: "...", ... }
});

export const subCategories = pgTable("sub_categories", {
  id: serial("id").primaryKey(),
  categoryKey: varchar("category_key", { length: 100 }).notNull(), // e.g. "film_animation", "music"
  key: varchar("key", { length: 100 }).notNull(), // unique slug/key
  name: varchar("name", { length: 255 }).notNull(), // English name
  translations: text("translations").default("{}"), // JSON string of { english: "...", arabic: "...", ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sub_cat_parent_idx").on(table.categoryKey),
]);

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  videoId: varchar("video_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnail: varchar("thumbnail", { length: 500 }).notNull(),
  videoLocation: varchar("video_location", { length: 500 }).notNull(),
  videoType: varchar("video_type", { length: 50 }).default("video/mp4"), // local, youtube, vimeo
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  duration: varchar("duration", { length: 50 }).default("00:00"),
  size: integer("size").default(0),
  views: integer("views").default(0),
  categoryId: varchar("category_id", { length: 50 }).default("other"),
  subCategory: varchar("sub_category", { length: 50 }),
  tags: text("tags"),
  privacy: integer("privacy").default(0), // 0: public, 1: private, 2: unlisted
  ageRestriction: integer("age_restriction").default(1), // 1: all, 2: 18+
  commentsEnabled: boolean("comments_enabled").default(true),
  isShort: boolean("is_short").default(false),
  isMovie: boolean("is_movie").default(false),
  movieRelease: varchar("movie_release", { length: 50 }),
  rating: doublePrecision("rating").default(0),
  stars: text("stars"),
  producer: varchar("producer", { length: 255 }),
  country: varchar("country", { length: 100 }),
  quality: varchar("quality", { length: 50 }).default("HD"),
  isApproved: boolean("is_approved").default(true),
  featured: boolean("featured").default(false),
  monetization: boolean("monetization").default(false),
  price: doublePrecision("price").default(0),
  license: varchar("license", { length: 100 }).default("Royalty Free License (RF)"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("video_user_idx").on(table.userId),
  index("video_id_idx").on(table.videoId),
  index("video_views_idx").on(table.views),
  index("video_cat_idx").on(table.categoryId),
  index("video_movie_idx").on(table.isMovie),
]);

// ==========================================
// Engagement: Views, Likes, Comments, Subs
// ==========================================
export const views = pgTable("views", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: varchar("ip_address", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likesDislikes = pgTable("likes_dislikes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  type: integer("type").notNull(), // 1: like, 2: dislike
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("like_user_video_idx").on(table.userId, table.videoId),
]);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("comment_video_idx").on(table.videoId),
]);

export const commentReplies = pgTable("comment_replies", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  channelId: integer("channel_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sub_subscriber_channel_idx").on(table.subscriberId, table.channelId),
]);

// ==========================================
// Playlists, History, Watch Later
// ==========================================
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  listId: varchar("list_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  privacy: integer("privacy").default(0), // 0: public, 1: private
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playlistVideos = pgTable("playlist_videos", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const watchLater = pgTable("watch_later", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Articles / Blog Schema (PlayTube Parity)
// ==========================================
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  text: text("text").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  image: text("image").default("/upload/photos/d-cover.jpg"),
  tags: text("tags").default(""),
  views: integer("views").default(0),
  shared: integer("shared").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("article_user_idx").on(table.userId),
  index("article_cat_idx").on(table.category),
]);

export const articleComments = pgTable("article_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Wallet Transactions & Pro Memberships
// ==========================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdraw, pro_pkg, video_purchase
  amount: doublePrecision("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: varchar("status", { length: 50 }).default("completed"), // completed, pending, cancelled
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trans_user_idx").on(table.userId),
]);

// ==========================================
// User Direct Messaging Schema
// ==========================================
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toId: integer("to_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  seen: boolean("seen").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("msg_from_idx").on(table.fromId),
  index("msg_to_idx").on(table.toId),
]);

// ==========================================
// User Activities & System Announcements
// ==========================================
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id")
    .references(() => videos.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // upload, like, comment, subscribe, post
  text: text("text"),
  image: text("image"),
  time: timestamp("time").defaultNow().notNull(),
}, (table) => [
  index("act_user_idx").on(table.userId),
]);

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Config / Site Settings
// ==========================================
export const siteConfig = pgTable("config", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  value: text("value").notNull(),
});

// ==========================================
// Payments & Ads Tables (PlayTube Full Parity)
// ==========================================
export const bankReceipts = pgTable("bank_receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiptImg: text("receipt_img").notNull(),
  price: doublePrecision("price").notNull().default(0),
  mode: varchar("mode", { length: 50 }).default("wallet"), // wallet, pro
  status: integer("status").default(0), // 0: pending, 1: approved, 2: declined
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoAds = pgTable("video_ads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("video"), // video, image, vast
  adMedia: text("ad_media").notNull(),
  adUrl: text("ad_url").notNull(),
  clicks: integer("clicks").default(0),
  views: integer("views").default(0),
  duration: integer("duration").default(10), // duration in seconds
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const websiteAds = pgTable("website_ads", {
  id: serial("id").primaryKey(),
  placement: varchar("placement", { length: 100 }).notNull().unique(), // header, footer, watch_sidebar, watch_comments
  code: text("code").default(""),
  active: boolean("active").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAds = pgTable("user_ads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetAudience: varchar("target_audience", { length: 100 }).default("All"),
  placement: varchar("placement", { length: 100 }).default("Videos (Format Video / Image)"),
  pricing: varchar("pricing", { length: 50 }).default("cpc"), // cpc, cpm
  dayLimit: doublePrecision("day_limit").default(0),
  totalLimit: doublePrecision("total_limit").default(0),
  mediaUrl: text("media_url"),
  status: integer("status").default(1), // 1: Active, 0: Inactive
  clicks: integer("clicks").default(0),
  views: integer("views").default(0),
  spent: doublePrecision("spent").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paypalEmail: varchar("paypal_email", { length: 255 }),
  status: integer("status").default(0), // 0: pending, 1: paid, 2: declined
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  currencyCode: varchar("currency_code", { length: 10 }).notNull().unique(),
  currencySymbol: varchar("currency_symbol", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g. "English", "Arabic", "russian"
  iso: varchar("iso", { length: 20 }).notNull(), // e.g. "en", "ar", "ru"
  status: varchar("status", { length: 20 }).default("active").notNull(), // "active" or "disabled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const languageKeys = pgTable("language_keys", {
  id: serial("id").primaryKey(),
  keyName: varchar("key_name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customProfileFields = pgTable("custom_profile_fields", {
  id: serial("id").primaryKey(),
  fieldType: varchar("field_type", { length: 50 }).default("textbox").notNull(),
  fieldName: varchar("field_name", { length: 255 }).notNull(),
  fieldLength: integer("field_length").default(32).notNull(),
  fieldDescription: text("field_description").default(""),
  placement: varchar("placement", { length: 50 }).default("general").notNull(), // general, profile, social, none
  showOnRegistration: boolean("show_on_registration").default(false),
  showOnProfile: boolean("show_on_profile").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, verified, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monetizationRequests = pgTable("monetization_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, verified, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Movies Categories Schema (PlayTube Parity)
// ==========================================
export const movieCategories = pgTable("movie_categories", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  translations: text("translations").default("{}"), // JSON string of { en: "Action", ar: "...", ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
