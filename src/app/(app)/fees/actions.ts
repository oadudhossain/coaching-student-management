"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordPayment(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").upsert(
    {
      student_id: String(fd.get("student_id")),
      batch_id: String(fd.get("batch_id")),
      month: String(fd.get("month")),
      amount: Number(fd.get("amount") || 0),
      method: String(fd.get("method") || "cash"),
    },
    { onConflict: "student_id,batch_id,month" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/fees");
  revalidatePath("/dashboard");
}

export async function undoPayment(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/fees");
  revalidatePath("/dashboard");
}
