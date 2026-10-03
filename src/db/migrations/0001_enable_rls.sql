-- Migration: Enable Row Level Security and Revoke Direct PostgREST Privileges
-- Generated on: 2026-10-03

ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."accounts" FROM anon, authenticated;

ALTER TABLE public."activities" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."activities" FROM anon, authenticated;

ALTER TABLE public."admininvitations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."admininvitations" FROM anon, authenticated;

ALTER TABLE public."announcements" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."announcements" FROM anon, authenticated;

ALTER TABLE public."article_comments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."article_comments" FROM anon, authenticated;

ALTER TABLE public."articles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."articles" FROM anon, authenticated;

ALTER TABLE public."bank_receipts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."bank_receipts" FROM anon, authenticated;

ALTER TABLE public."banned" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."banned" FROM anon, authenticated;

ALTER TABLE public."categories" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."categories" FROM anon, authenticated;

ALTER TABLE public."comment_replies" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."comment_replies" FROM anon, authenticated;

ALTER TABLE public."comments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."comments" FROM anon, authenticated;

ALTER TABLE public."config" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."config" FROM anon, authenticated;

ALTER TABLE public."copyright_report" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."copyright_report" FROM anon, authenticated;

ALTER TABLE public."currencies" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."currencies" FROM anon, authenticated;

ALTER TABLE public."custom_pages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."custom_pages" FROM anon, authenticated;

ALTER TABLE public."custom_profile_fields" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."custom_profile_fields" FROM anon, authenticated;

ALTER TABLE public."faqs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."faqs" FROM anon, authenticated;

ALTER TABLE public."invitation_links" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."invitation_links" FROM anon, authenticated;

ALTER TABLE public."language_keys" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."language_keys" FROM anon, authenticated;

ALTER TABLE public."language_translations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."language_translations" FROM anon, authenticated;

ALTER TABLE public."languages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."languages" FROM anon, authenticated;

ALTER TABLE public."likes_dislikes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."likes_dislikes" FROM anon, authenticated;

ALTER TABLE public."manage_pro" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."manage_pro" FROM anon, authenticated;

ALTER TABLE public."messages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."messages" FROM anon, authenticated;

ALTER TABLE public."monetization_requests" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."monetization_requests" FROM anon, authenticated;

ALTER TABLE public."movie_categories" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."movie_categories" FROM anon, authenticated;

ALTER TABLE public."payment_requests" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."payment_requests" FROM anon, authenticated;

ALTER TABLE public."payments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."payments" FROM anon, authenticated;

ALTER TABLE public."playlist_videos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."playlist_videos" FROM anon, authenticated;

ALTER TABLE public."playlists" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."playlists" FROM anon, authenticated;

ALTER TABLE public."reports" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."reports" FROM anon, authenticated;

ALTER TABLE public."sessions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."sessions" FROM anon, authenticated;

ALTER TABLE public."sub_categories" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."sub_categories" FROM anon, authenticated;

ALTER TABLE public."subscriptions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."subscriptions" FROM anon, authenticated;

ALTER TABLE public."terms_pages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."terms_pages" FROM anon, authenticated;

ALTER TABLE public."transactions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."transactions" FROM anon, authenticated;

ALTER TABLE public."user_ads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."user_ads" FROM anon, authenticated;

ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."users" FROM anon, authenticated;

ALTER TABLE public."verification_requests" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."verification_requests" FROM anon, authenticated;

ALTER TABLE public."verifications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."verifications" FROM anon, authenticated;

ALTER TABLE public."video_ads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."video_ads" FROM anon, authenticated;

ALTER TABLE public."videos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."videos" FROM anon, authenticated;

ALTER TABLE public."views" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."views" FROM anon, authenticated;

ALTER TABLE public."watch_history" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."watch_history" FROM anon, authenticated;

ALTER TABLE public."watch_later" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."watch_later" FROM anon, authenticated;

ALTER TABLE public."website_ads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."website_ads" FROM anon, authenticated;

