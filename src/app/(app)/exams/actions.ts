"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isFile, uploadImage } from "@/lib/upload";

export async function addExam(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("exams").insert({
    batch_id: String(fd.get("batch_id")),
    title: String(fd.get("title") || "").trim(),
    exam_date: String(fd.get("exam_date") || "") || null,
    total_marks: Number(fd.get("total_marks") || 100),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/exams");
}

export async function deleteExam(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("exams").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/exams");
}

export async function saveResults(fd: FormData) {
  const supabase = await createClient();
  const exam_id = String(fd.get("exam_id"));

  const records = Array.from(fd.entries())
    .filter(([key, value]) => key.startsWith("m_") && String(value).trim() !== "")
    .map(([key, value]) => ({
      exam_id,
      student_id: key.slice(2),
      marks: Number(value),
    }));

  if (records.length === 0) return;

  const { error } = await supabase
    .from("results")
    .upsert(records, { onConflict: "exam_id,student_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/exams/${exam_id}`);
}

// টপারকে ছবি সহ হোম পেজে দেখানো
export async function featureResult(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (fd.get("consent") !== "on") {
    throw new Error("অভিভাবকের সম্মতি নিশ্চিত করুন");
  }

  const exam_id = String(fd.get("exam_id"));
  const payload: Record<string, unknown> = {
    exam_id,
    student_id: String(fd.get("student_id")),
    rank_no: Number(fd.get("rank") || 1),
    marks: Number(fd.get("marks") || 0),
    total_marks: Number(fd.get("total_marks") || 100),
  };

  const photo = fd.get("photo");
  if (isFile(photo)) {
    payload.photo_url = await uploadImage(supabase, user.id, photo, "toppers");
  }

  const { error } = await supabase
    .from("featured_results")
    .upsert(payload, { onConflict: "exam_id,student_id" });
  if (error) throw new Error(error.message);

  revalidatePath(`/exams/${exam_id}`);
  revalidatePath("/site");
  revalidatePath("/", "layout");
}
