"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isFile, uploadImage } from "@/lib/upload";

const text = (fd: FormData, key: string) => String(fd.get(key) || "").trim();

function refresh() {
  revalidatePath("/site");
  revalidatePath("/", "layout");
}

// শিক্ষকের পরিচিতি, হিরো সেকশন, যোগাযোগ ইত্যাদি
export async function saveSite(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const years = text(fd, "experience_years");
  const payload: Record<string, unknown> = {
    teacher_id: user.id,
    teacher_name: text(fd, "teacher_name"),
    teacher_title: text(fd, "teacher_title"),
    hero_headline: text(fd, "hero_headline"),
    hero_subtitle: text(fd, "hero_subtitle"),
    teacher_bio: text(fd, "teacher_bio"),
    qualifications: text(fd, "qualifications"),
    experience_years: years ? Number(years) : null,
    about: text(fd, "about"),
    admission_info: text(fd, "admission_info"),
    email: text(fd, "email"),
    whatsapp: text(fd, "whatsapp"),
    facebook_url: text(fd, "facebook_url"),
    map_url: text(fd, "map_url"),
    office_hours: text(fd, "office_hours"),
    updated_at: new Date().toISOString(),
  };

  const photo = fd.get("teacher_photo");
  if (isFile(photo)) {
    payload.teacher_photo_url = await uploadImage(supabase, user.id, photo, "teacher");
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "teacher_id" });
  if (error) throw new Error(error.message);
  refresh();
}

// গ্যালারিতে ছবি যোগ (একবারে সর্বোচ্চ ৩টি)
export async function addGalleryImages(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const files = fd.getAll("images").filter(isFile).slice(0, 3);
  const caption = text(fd, "caption");

  for (const file of files) {
    const url = await uploadImage(supabase, user.id, file, "gallery");
    const { error } = await supabase.from("gallery_images").insert({ url, caption });
    if (error) throw new Error(error.message);
  }
  refresh();
}

export async function deleteGalleryImage(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

export async function removeFeatured(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("featured_results").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}
