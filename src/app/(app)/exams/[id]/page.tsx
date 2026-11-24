import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rows } from "@/lib/utils";
import { featureResult, saveResults } from "../actions";

const rankLabel = (n: number) =>
  n === 1 ? "প্রথম" : n === 2 ? "দ্বিতীয়" : n === 3 ? "তৃতীয়" : `${n}তম`;

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from("exams")
    .select("*, batches(name)")
    .eq("id", id)
    .maybeSingle();

  if (!exam) notFound();
  const ex = exam as any;

  const [enrRes, resRes, featRes] = await Promise.all([
    supabase.from("enrollments").select("student_id, students(name)").eq("batch_id", ex.batch_id),
    supabase.from("results").select("student_id,marks").eq("exam_id", id),
    supabase.from("featured_results").select("student_id").eq("exam_id", id),
  ]);

  const students = rows(enrRes).sort((a, b) =>
    String(a.students?.name).localeCompare(String(b.students?.name), "bn")
  );
  const marks = new Map<string, number>(
    rows(resRes).map((r) => [r.student_id, Number(r.marks)])
  );
  const featured = new Set<string>(rows(featRes).map((f) => f.student_id));

  const values = Array.from(marks.values());
  const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const max = values.length ? Math.max(...values) : 0;

  // সেরা ৩ (সমান নম্বরে সমান র‍্যাঙ্ক)
  const scored = students
    .filter((s) => marks.has(s.student_id))
    .map((s) => ({
      id: s.student_id as string,
      name: s.students?.name as string,
      marks: marks.get(s.student_id) as number,
    }));
  const top = scored
    .map((r) => ({ ...r, rank: 1 + scored.filter((o) => o.marks > r.marks).length }))
    .filter((r) => r.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/exams" className="text-sm text-indigo-600 hover:underline">← পরীক্ষার তালিকা</Link>
        <h1 className="h1 mt-1">{ex.title}</h1>
        <p className="text-sm text-slate-500">
          {ex.batches?.name} · {ex.exam_date || "তারিখ নেই"} · পূর্ণমান {ex.total_marks}
        </p>
      </div>

      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card"><p className="text-xs text-slate-500">নম্বর দেওয়া হয়েছে</p><p className="text-xl font-bold">{values.length}/{students.length}</p></div>
          <div className="card"><p className="text-xs text-slate-500">গড়</p><p className="text-xl font-bold">{avg.toFixed(1)}</p></div>
          <div className="card"><p className="text-xs text-slate-500">সর্বোচ্চ</p><p className="text-xl font-bold">{max}</p></div>
        </div>
      )}

      {students.length === 0 ? (
        <p className="text-sm text-slate-500">এই ব্যাচে কোনো শিক্ষার্থী ভর্তি নেই।</p>
      ) : (
        <form action={saveResults} className="space-y-3">
          <input type="hidden" name="exam_id" value={id} />
          <div className="space-y-2">
            {students.map((s) => (
              <div key={s.student_id} className="card flex items-center justify-between gap-3">
                <span className="font-medium">{s.students?.name}</span>
                <input
                  name={`m_${s.student_id}`}
                  type="number"
                  step="0.5"
                  min="0"
                  max={ex.total_marks}
                  defaultValue={marks.get(s.student_id) ?? ""}
                  className="input w-24"
                />
              </div>
            ))}
          </div>
          <button className="btn">নম্বর সংরক্ষণ করুন</button>
        </form>
      )}

      {top.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold">কৃতী শিক্ষার্থী: হোম পেজে দেখান</h2>
          <p className="text-xs text-slate-500">
            নাম, ছবি ও নম্বর সবার জন্য পাবলিক ওয়েবসাইটে দেখা যাবে। তাই শিক্ষার্থী/অভিভাবকের সম্মতি নিয়ে নিন।
          </p>
          {top.map((t) => (
            <form key={t.id} action={featureResult} className="card grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="exam_id" value={id} />
              <input type="hidden" name="student_id" value={t.id} />
              <input type="hidden" name="rank" value={t.rank} />
              <input type="hidden" name="marks" value={t.marks} />
              <input type="hidden" name="total_marks" value={ex.total_marks} />
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {rankLabel(t.rank)} স্থান · {t.marks}/{ex.total_marks}
                </p>
                {featured.has(t.id) && (
                  <p className="mt-1 text-xs text-emerald-700">হোম পেজে আছে (আবার সংরক্ষণ করলে হালনাগাদ হবে)</p>
                )}
              </div>
              <div>
                <label className="label">ছবি (ঐচ্ছিক, সর্বোচ্চ ১.৫ MB)</label>
                <input name="photo" type="file" accept="image/*" className="input" />
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-xs">
                  <input type="checkbox" name="consent" required className="mt-0.5" />
                  <span>অভিভাবকের সম্মতি আছে</span>
                </label>
                <button className="btn">হোম পেজে দিন</button>
              </div>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
