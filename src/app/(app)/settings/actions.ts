"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSettings(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  let logo_url: string | undefined;
  const file = fd.get("logo");

  if (file instanceof File && file.size > 0) {
    if (file.size > 1_000_000) {
      throw new Error("লোগোর ফাইল ১ MB এর কম হতে হবে");
    }
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("logos")
      .upload(path, file, { contentType: file.type });
    if (upErr) throw new Error(upErr.message);
    logo_url = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
  }

  const payload: Record<string, unknown> = {
    teacher_id: user.id,
    name: String(fd.get("name") || "").trim() || "আমার কোচিং সেন্টার",
    address: String(fd.get("address") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    updated_at: new Date().toISOString(),
  };
  if (logo_url) payload.logo_url = logo_url;

  const { error } = await supabase
    .from("center_settings")
    .upsert(payload, { onConflict: "teacher_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
