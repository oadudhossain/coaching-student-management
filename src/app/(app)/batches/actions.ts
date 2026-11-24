"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/batches");
  revalidatePath("/", "layout");
}

export async function addBatch(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("batches").insert({
    name: String(fd.get("name") || "").trim(),
    subject: String(fd.get("subject") || "").trim(),
    schedule: String(fd.get("schedule") || "").trim(),
    monthly_fee: Number(fd.get("monthly_fee") || 0),
    description: String(fd.get("description") || "").trim(),
    is_public: fd.get("is_public") === "on",
    show_fee: fd.get("show_fee") === "on",
  });
  if (error) throw new Error(error.message);
  refresh();
}

// ওয়েবসাইটে ব্যাচ কীভাবে দেখাবে
export async function updateBatchPublic(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batches")
    .update({
      description: String(fd.get("description") || "").trim(),
      schedule: String(fd.get("schedule") || "").trim(),
      is_public: fd.get("is_public") === "on",
      show_fee: fd.get("show_fee") === "on",
    })
    .eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteBatch(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("batches").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

export async function enroll(fd: FormData) {
  const student_id = String(fd.get("student_id") || "");
  if (!student_id) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      { student_id, batch_id: String(fd.get("batch_id")) },
      { onConflict: "student_id,batch_id", ignoreDuplicates: true }
    );
  if (error) throw new Error(error.message);
  refresh();
}

export async function unenroll(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}
