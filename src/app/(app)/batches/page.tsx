import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import { rows, taka } from "@/lib/utils";
import { addBatch, deleteBatch, enroll, unenroll, updateBatchPublic } from "./actions";

export default async function BatchesPage() {
  const supabase = await createClient();
  const [batchRes, studentRes] = await Promise.all([
    supabase
      .from("batches")
      .select("*, enrollments(id, student_id, students(name))")
      .order("created_at"),
    supabase.from("students").select("id,name").eq("status", "active").order("name"),
  ]);
  const batches = rows(batchRes);
  const students = rows(studentRes);

  return (
    <div className="space-y-5">
      <h1 className="h1">ব্যাচ</h1>

      <form action={addBatch} className="card grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="name">ব্যাচের নাম</label>
          <input id="name" name="name" required placeholder="যেমন: নবম শ্রেণি - সকাল" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="subject">বিষয়</label>
          <input id="subject" name="subject" placeholder="যেমন: গণিত" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="schedule">সময়সূচি</label>
          <input id="schedule" name="schedule" placeholder="শনি, সোম, বুধ - ৪টা" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="monthly_fee">মাসিক ফি (৳)</label>
          <input id="monthly_fee" name="monthly_fee" type="number" min="0" defaultValue={0} className="input" />
        </div>
        <div className="sm:col-span-4">
          <label className="label" htmlFor="description">ওয়েবসাইটের জন্য ছোট বিবরণ (ঐচ্ছিক)</label>
          <textarea id="description" name="description" rows={2} className="input" />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm sm:col-span-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_public" defaultChecked /> ওয়েবসাইটে দেখান
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show_fee" /> ওয়েবসাইটে ফি দেখান
          </label>
        </div>
        <div className="sm:col-span-4">
          <button className="btn">ব্যাচ যোগ করুন</button>
        </div>
      </form>

      {batches.length === 0 && (
        <p className="text-sm text-slate-500">এখনও কোনো ব্যাচ নেই।</p>
      )}

      {batches.map((b) => {
        const enrolled = (b.enrollments ?? []) as any[];
        const enrolledIds = new Set(enrolled.map((e) => e.student_id));
        const available = students.filter((s) => !enrolledIds.has(s.id));

        return (
          <section key={b.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h2 className="font-bold">
                  {b.name}
                  {!b.is_public && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">
                      ওয়েবসাইটে লুকানো
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  {b.subject || "—"} · {b.schedule || "সময়সূচি নেই"} · মাসিক {taka(b.monthly_fee)}
                </p>
              </div>
              <Link href={`/batch/${b.id}`} target="_blank" className="btn-ghost">
                পাবলিক পেজ
              </Link>
              <form action={deleteBatch}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton
                  className="btn-danger"
                  message="এই ব্যাচ ও এর হাজিরা, ফি, পরীক্ষা সব মুছে যাবে। নিশ্চিত?"
                >
                  মুছুন
                </ConfirmButton>
              </form>
            </div>

            <details className="rounded-lg border border-slate-200 p-3 text-sm">
              <summary className="cursor-pointer text-slate-700">ওয়েবসাইটে দেখানোর সেটিং</summary>
              <form action={updateBatchPublic} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={b.id} />
                <div>
                  <label className="label">সময়সূচি</label>
                  <input name="schedule" defaultValue={b.schedule ?? ""} className="input" />
                </div>
                <div>
                  <label className="label">বিবরণ</label>
                  <textarea name="description" rows={2} defaultValue={b.description ?? ""} className="input" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_public" defaultChecked={b.is_public} /> ওয়েবসাইটে দেখান
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="show_fee" defaultChecked={b.show_fee} /> ফি দেখান
                  </label>
                </div>
                <button className="btn">সংরক্ষণ</button>
              </form>
            </details>

            <form action={enroll} className="flex gap-2">
              <input type="hidden" name="batch_id" value={b.id} />
              <select name="student_id" className="input" defaultValue="">
                <option value="" disabled>শিক্ষার্থী বেছে নিন…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button className="btn whitespace-nowrap">ভর্তি করুন</button>
            </form>

            <ul className="divide-y divide-slate-100 text-sm">
              {enrolled.length === 0 && (
                <li className="py-2 text-slate-500">এই ব্যাচে কেউ নেই।</li>
              )}
              {enrolled.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <span>{e.students?.name}</span>
                  <form action={unenroll}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="btn-danger">সরান</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
