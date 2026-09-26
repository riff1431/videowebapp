CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "accounts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" integer NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "categories_key_unique" UNIQUE("key")
);
;
CREATE TABLE "comment_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"text" text NOT NULL,
	"likes" integer DEFAULT 0,
	"dislikes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "likes_dislikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"type" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "playlist_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"privacy" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playlists_list_id_unique" UNIQUE("list_id")
);
;
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
;
CREATE TABLE "config" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "config_name_unique" UNIQUE("name")
);
;
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"channel_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"username" varchar(50) NOT NULL,
	"display_username" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"image" varchar(500),
	"avatar" varchar(500) DEFAULT '/upload/photos/d-avatar.jpg',
	"cover" varchar(500) DEFAULT '/upload/photos/d-cover.jpg',
	"password" text,
	"role" varchar(50) DEFAULT 'user',
	"is_admin" boolean DEFAULT false,
	"wallet" double precision DEFAULT 0,
	"balance" double precision DEFAULT 0,
	"about" text,
	"gender" varchar(20) DEFAULT 'male',
	"country_id" integer DEFAULT 0,
	"age" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"is_pro" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"google" varchar(255),
	"facebook" varchar(255),
	"twitter" varchar(255),
	"instagram" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
;
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
;
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"thumbnail" varchar(500) NOT NULL,
	"video_location" varchar(500) NOT NULL,
	"video_type" varchar(50) DEFAULT 'video/mp4',
	"youtube_url" varchar(500),
	"duration" varchar(50) DEFAULT '00:00',
	"size" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"category_id" varchar(50) DEFAULT 'other',
	"sub_category" varchar(50),
	"tags" text,
	"privacy" integer DEFAULT 0,
	"age_restriction" integer DEFAULT 1,
	"comments_enabled" boolean DEFAULT true,
	"is_short" boolean DEFAULT false,
	"is_movie" boolean DEFAULT false,
	"movie_release" varchar(50),
	"rating" double precision DEFAULT 0,
	"stars" text,
	"producer" varchar(255),
	"country" varchar(100),
	"quality" varchar(50) DEFAULT 'HD',
	"is_approved" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"monetization" boolean DEFAULT false,
	"price" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_video_id_unique" UNIQUE("video_id")
);
;
CREATE TABLE "views" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" integer NOT NULL,
	"user_id" integer,
	"ip_address" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "watch_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
;
CREATE TABLE "watch_later" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"video_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "comments" ADD CONSTRAINT "comments_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "likes_dislikes" ADD CONSTRAINT "likes_dislikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "likes_dislikes" ADD CONSTRAINT "likes_dislikes_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_channel_id_users_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "views" ADD CONSTRAINT "views_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "views" ADD CONSTRAINT "views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;;
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;;
ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;;
CREATE INDEX "comment_video_idx" ON "comments" USING btree ("video_id");;
CREATE INDEX "like_user_video_idx" ON "likes_dislikes" USING btree ("user_id","video_id");;
CREATE INDEX "sub_subscriber_channel_idx" ON "subscriptions" USING btree ("subscriber_id","channel_id");;
CREATE INDEX "video_user_idx" ON "videos" USING btree ("user_id");;
CREATE INDEX "video_id_idx" ON "videos" USING btree ("video_id");;
CREATE INDEX "video_views_idx" ON "videos" USING btree ("views");;
CREATE INDEX "video_cat_idx" ON "videos" USING btree ("category_id");;
CREATE INDEX "video_movie_idx" ON "videos" USING btree ("is_movie");;

CREATE TABLE IF NOT EXISTS "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"text" text NOT NULL,
	"category" varchar(100) DEFAULT 'general',
	"image" varchar(500) DEFAULT '/upload/photos/d-cover.jpg',
	"tags" varchar(500) DEFAULT '',
	"views" integer DEFAULT 0,
	"shared" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);;

CREATE TABLE IF NOT EXISTS "article_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"article_id" integer NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;

CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"type" varchar(50) NOT NULL,
	"amount" double precision NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"status" varchar(50) DEFAULT 'completed',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);;

CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"to_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"text" text NOT NULL,
	"seen" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);;

CREATE TABLE IF NOT EXISTS "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"video_id" integer REFERENCES "videos"("id") ON DELETE CASCADE,
	"type" varchar(50) NOT NULL,
	"time" timestamp DEFAULT now() NOT NULL
);;

CREATE TABLE IF NOT EXISTS "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
