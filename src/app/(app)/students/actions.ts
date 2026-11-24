"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/students");
  revalidatePath("/dashboard");
}

export async function addStudent(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({
    name: String(fd.get("name") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    guardian_phone: String(fd.get("guardian_phone") || "").trim(),
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function toggleStudent(fd: FormData) {
  const supabase = await createClient();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) === "active" ? "inactive" : "active";
  const { error } = await supabase.from("students").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteStudent(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

// অনলাইন আবেদন অনুমোদন: সক্রিয় করা + আবেদনের ব্যাচে ভর্তি
export async function approveStudent(fd: FormData) {
  const supabase = await createClient();
  const id = String(fd.get("id"));
  const batchId = String(fd.get("applied_batch_id") || "");

  const { error } = await supabase.from("students").update({ status: "active" }).eq("id", id);
  if (error) throw new Error(error.message);

  if (batchId) {
    const { error: enrErr } = await supabase
      .from("enrollments")
      .upsert(
        { student_id: id, batch_id: batchId },
        { onConflict: "student_id,batch_id", ignoreDuplicates: true }
      );
    if (enrErr) throw new Error(enrErr.message);
  }
  refresh();
  revalidatePath("/batches");
}

// পোর্টালের গোপন লিংক নতুন করে বানানো (পুরনো লিংক অকেজো হয়ে যায়)
export async function regenerateLink(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ portal_token: randomUUID() })
    .eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}
