import { createClient } from "@/lib/supabase/server";
import { rows, todayDhaka } from "@/lib/utils";
import { saveAttendance } from "./actions";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date || todayDhaka();
  const supabase = await createClient();

  const batches = rows(await supabase.from("batches").select("id,name").order("created_at"));
  const batchId = sp.batch || "";

  let enrolled: any[] = [];
  const existing = new Map<string, string>();

  if (batchId) {
    const [enr, att] = await Promise.all([
      supabase.from("enrollments").select("student_id, students(name)").eq("batch_id", batchId),
      supabase.from("attendance").select("student_id,status").eq("batch_id", batchId).eq("date", date),
    ]);
    enrolled = rows(enr).sort((a, b) =>
      String(a.students?.name).localeCompare(String(b.students?.name), "bn")
    );
    rows(att).forEach((a) => existing.set(a.student_id, a.status));
  }

  const savedCount = existing.size;

  return (
    <div className="space-y-5">
      <h1 className="h1">হাজিরা</h1>

      <form method="get" className="card grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="batch">ব্যাচ</label>
          <select id="batch" name="batch" defaultValue={batchId} className="input">
            <option value="">বেছে নিন…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">তারিখ</label>
          <input id="date" name="date" type="date" defaultValue={date} className="input" />
        </div>
        <div className="flex items-end">
          <button className="btn-ghost w-full">দেখান</button>
        </div>
      </form>

      {batchId && enrolled.length === 0 && (
        <p className="text-sm text-slate-500">এই ব্যাচে কোনো শিক্ষার্থী ভর্তি নেই।</p>
      )}

      {batchId && enrolled.length > 0 && (
        <form action={saveAttendance} className="space-y-3">
          <input type="hidden" name="batch_id" value={batchId} />
          <input type="hidden" name="date" value={date} />
          {savedCount > 0 && (
            <p className="text-xs text-emerald-700">এই তারিখের হাজিরা আগে সংরক্ষিত আছে; বদলে আবার সংরক্ষণ করতে পারেন।</p>
          )}
          <div className="space-y-2">
            {enrolled.map((e) => {
              const status = existing.get(e.student_id) ?? "present";
              return (
                <div key={e.student_id} className="card flex items-center justify-between gap-3">
                  <span className="font-medium">{e.students?.name}</span>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`s_${e.student_id}`} value="present" defaultChecked={status === "present"} />
                      উপস্থিত
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`s_${e.student_id}`} value="absent" defaultChecked={status === "absent"} />
                      অনুপস্থিত
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn w-full sm:w-auto">হাজিরা সংরক্ষণ করুন</button>
        </form>
      )}
    </div>
  );
}
