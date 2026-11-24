"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/utils";

const text = (fd: FormData, key: string) => String(fd.get(key) || "").trim();

export async function submitApplication(fd: FormData) {
  // হানিপট: বট এই লুকানো ঘরটা পূরণ করে
  if (text(fd, "website")) redirect("/apply?ok=1");

  const phone = text(fd, "phone");
  if (!/^[0-9+\-\s]{6,20}$/.test(phone) || text(fd, "name").length < 2) {
    redirect("/apply?error=1");
  }

  const batch = text(fd, "batch_id");
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_application", {
    p_name: text(fd, "name"),
    p_phone: phone,
    p_guardian_name: text(fd, "guardian_name"),
    p_guardian_phone: text(fd, "guardian_phone"),
    p_class: text(fd, "class_level"),
    p_batch_id: UUID_RE.test(batch) ? batch : null,
    p_message: text(fd, "message"),
  });

  if (error) redirect("/apply?error=1");
  redirect("/apply?ok=1");
}
