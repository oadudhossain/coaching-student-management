import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { monthDhaka, rows, taka, todayDhaka } from "@/lib/utils";

export default async function Dashboard() {
  const supabase = await createClient();
  const today = todayDhaka();
  const month = monthDhaka();

  const [students, pendingRes, batches, att, pays, enr] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("batches").select("id", { count: "exact", head: true }),
    supabase.from("attendance").select("status").eq("date", today),
    supabase.from("payments").select("student_id,batch_id,amount").eq("month", month),
    supabase.from("enrollments").select("student_id,batch_id,batches(monthly_fee)"),
  ]);

  const attRows = rows(att);
  const present = attRows.filter((a) => a.status === "present").length;
  const absent = attRows.filter((a) => a.status === "absent").length;

  const payRows = rows(pays);
  const collected = payRows.reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const paidKeys = new Set(payRows.map((p) => `${p.student_id}|${p.batch_id}`));
  const dueRows = rows(enr).filter((e) => !paidKeys.has(`${e.student_id}|${e.batch_id}`));
  const dueAmount = dueRows.reduce((s, e) => s + Number(e.batches?.monthly_fee ?? 0), 0);

  const pending = pendingRes.count ?? 0;

  const stats: [string, string][] = [
    ["সক্রিয় শিক্ষার্থী", String(students.count ?? 0)],
    ["মোট ব্যাচ", String(batches.count ?? 0)],
    ["আজ উপস্থিত", String(present)],
    ["আজ অনুপস্থিত", String(absent)],
    ["এ মাসে আদায়", taka(collected)],
    [`বকেয়া (${dueRows.length} জন)`, taka(dueAmount)],
  ];

  return (
    <div className="space-y-4">
      <h1 className="h1">ড্যাশবোর্ড</h1>

      {pending > 0 && (
        <Link
          href="/students"
          className="block rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 hover:bg-amber-100"
        >
          {pending.toLocaleString("bn-BD")}টি নতুন ভর্তির আবেদন অপেক্ষায় আছে। দেখুন →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
