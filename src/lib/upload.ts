import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BYTES = 1_500_000;

export const isFile = (v: FormDataEntryValue | null): v is File =>
  v instanceof File && v.size > 0;

// ছবি site-images বাকেটে আপলোড করে পাবলিক URL ফেরত দেয়
export async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  folder: string
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("শুধু ছবি আপলোড করা যাবে");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("প্রতিটি ছবি ১.৫ MB এর কম হতে হবে");
  }
  const ext =
    (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
