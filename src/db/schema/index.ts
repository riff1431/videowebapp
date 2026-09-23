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
});

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
  image: varchar("image", { length: 500 }).default("/upload/photos/d-cover.jpg"),
  tags: varchar("tags", { length: 500 }).default(""),
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
// Config / Site Settings
// ==========================================
export const siteConfig = pgTable("config", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  value: text("value").notNull(),
});


