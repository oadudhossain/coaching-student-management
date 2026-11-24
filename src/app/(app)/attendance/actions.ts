"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveAttendance(fd: FormData) {
  const supabase = await createClient();
  const batch_id = String(fd.get("batch_id"));
  const date = String(fd.get("date"));

  const records = Array.from(fd.entries())
    .filter(([key]) => key.startsWith("s_"))
    .map(([key, value]) => ({
      batch_id,
      date,
      student_id: key.slice(2),
      status: value === "absent" ? "absent" : "present",
    }));

  if (records.length === 0) return;

  const { error } = await supabase
    .from("attendance")
    .upsert(records, { onConflict: "batch_id,student_id,date" });
  if (error) throw new Error(error.message);

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
