import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import { rows } from "@/lib/utils";
import { addExam, deleteExam } from "./actions";

export default async function ExamsPage() {
  const supabase = await createClient();
  const [batchRes, examRes] = await Promise.all([
    supabase.from("batches").select("id,name").order("created_at"),
    supabase.from("exams").select("*, batches(name)").order("exam_date", { ascending: false }),
  ]);
  const batches = rows(batchRes);
  const exams = rows(examRes);

  return (
    <div className="space-y-5">
      <h1 className="h1">পরীক্ষা</h1>

      <form action={addExam} className="card grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="batch_id">ব্যাচ</label>
          <select id="batch_id" name="batch_id" required defaultValue="" className="input">
            <option value="" disabled>বেছে নিন…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="title">পরীক্ষার নাম</label>
          <input id="title" name="title" required placeholder="যেমন: মাসিক পরীক্ষা ১" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="exam_date">তারিখ</label>
          <input id="exam_date" name="exam_date" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="total_marks">পূর্ণমান</label>
          <input id="total_marks" name="total_marks" type="number" min="1" defaultValue={100} className="input" />
        </div>
        <div className="sm:col-span-4">
          <button className="btn">পরীক্ষা তৈরি করুন</button>
        </div>
      </form>

      <div className="space-y-2">
        {exams.length === 0 && (
          <p className="text-sm text-slate-500">এখনও কোনো পরীক্ষা নেই।</p>
        )}
        {exams.map((x) => (
          <div key={x.id} className="card flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{x.title}</p>
              <p className="text-xs text-slate-500">
                {x.batches?.name} · {x.exam_date || "তারিখ নেই"} · পূর্ণমান {x.total_marks}
              </p>
            </div>
            <Link href={`/exams/${x.id}`} className="btn-ghost">নম্বর</Link>
            <form action={deleteExam}>
              <input type="hidden" name="id" value={x.id} />
              <ConfirmButton className="btn-danger" message="এই পরীক্ষা ও এর সব নম্বর মুছে যাবে। নিশ্চিত?">
                মুছুন
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
