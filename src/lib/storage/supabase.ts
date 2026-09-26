import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://olhrhkbhfpwcsqxturko.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saHJoa2JoZnB3Y3NxeHR1cmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzgyNjQsImV4cCI6MjEwNTcxNDI2NH0.Bit0OS_Q2ND8FJ9xzsWuKY5HzvKnXlEq8ZvGPeTUDQo";

/**
 * Public client for client components and public storage/reads
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Helper to upload a file directly to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File | Blob | Buffer,
  contentType?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType: contentType || (file instanceof File ? file.type : "application/octet-stream"),
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "Failed to upload file to Supabase Storage" };
  }
}
