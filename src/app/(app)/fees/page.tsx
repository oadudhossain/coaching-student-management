import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import { monthDhaka, rows, taka } from "@/lib/utils";
import { recordPayment, undoPayment } from "./actions";

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const month = sp.month || monthDhaka();
  const supabase = await createClient();

  const [enrRes, payRes] = await Promise.all([
    supabase.from("enrollments").select("student_id,batch_id,students(name),batches(name,monthly_fee)"),
    supabase.from("payments").select("*").eq("month", month),
  ]);

  const enrollments = rows(enrRes).sort((a, b) =>
    String(a.students?.name).localeCompare(String(b.students?.name), "bn")
  );
  const payments = new Map<string, any>(
    rows(payRes).map((p) => [`${p.student_id}|${p.batch_id}`, p])
  );

  const collected = Array.from(payments.values()).reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const dueList = enrollments.filter((e) => !payments.has(`${e.student_id}|${e.batch_id}`));
  const dueAmount = dueList.reduce((s, e) => s + Number(e.batches?.monthly_fee ?? 0), 0);

  return (
    <div className="space-y-5">
      <h1 className="h1">ফি</h1>

      <form method="get" className="card flex items-end gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="month">মাস</label>
          <input id="month" name="month" type="month" defaultValue={month} className="input" />
        </div>
        <button className="btn-ghost">দেখান</button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-slate-500">আদায়</p>
          <p className="text-2xl font-bold text-emerald-700">{taka(collected)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">বকেয়া ({dueList.length} জন)</p>
          <p className="text-2xl font-bold text-red-600">{taka(dueAmount)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {enrollments.length === 0 && (
          <p className="text-sm text-slate-500">আগে ব্যাচে শিক্ষার্থী ভর্তি করুন।</p>
        )}
        {enrollments.map((e) => {
          const key = `${e.student_id}|${e.batch_id}`;
          const pay = payments.get(key);
          return (
            <div key={key} className="card flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{e.students?.name}</p>
                <p className="text-xs text-slate-500">
                  {e.batches?.name} · মাসিক {taka(e.batches?.monthly_fee)}
                </p>
              </div>

              {pay ? (
                <>
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    পরিশোধিত {taka(pay.amount)}
                  </span>
                  <Link href={`/fees/receipt/${pay.id}`} className="btn-ghost">রসিদ</Link>
                  <form action={undoPayment}>
                    <input type="hidden" name="id" value={pay.id} />
                    <ConfirmButton className="btn-danger" message="এই পেমেন্ট বাতিল করবেন?">
                      বাতিল
                    </ConfirmButton>
                  </form>
                </>
              ) : (
                <form action={recordPayment} className="flex items-center gap-2">
                  <input type="hidden" name="student_id" value={e.student_id} />
                  <input type="hidden" name="batch_id" value={e.batch_id} />
                  <input type="hidden" name="month" value={month} />
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    defaultValue={Number(e.batches?.monthly_fee ?? 0)}
                    className="input w-24"
                  />
                  <button className="btn whitespace-nowrap">পরিশোধ</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
