import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortal } from "@/lib/site";
import { bn, monthDhaka, taka } from "@/lib/utils";

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
  });

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPortal(token);
  if (!data) notFound();

  const batches: any[] = data.batches ?? [];
  const attendance: any[] = data.attendance ?? [];
  const payments: any[] = data.payments ?? [];
  const results: any[] = data.results ?? [];
  const month = monthDhaka();

  const batchName = (id: string) => batches.find((b) => b.id === id)?.name ?? "";

  // এ মাসের ফি অবস্থা
  const thisMonth = batches.map((b) => {
    const pay = payments.find((p) => p.batch_id === b.id && p.month === month);
    return { batch: b, pay };
  });
  const dueTotal = thisMonth
    .filter((x) => !x.pay)
    .reduce((s, x) => s + Number(x.batch.monthly_fee ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500">শিক্ষার্থী</p>
        <h1 className="text-2xl font-bold">{data.student?.name}</h1>
      </div>

      {/* ব্যাচ */}
      <section className="space-y-2">
        <h2 className="font-bold">আমার ব্যাচ</h2>
        {batches.length === 0 && <p className="text-sm text-slate-500">এখনও কোনো ব্যাচে ভর্তি নেই।</p>}
        {batches.map((b) => (
          <div key={b.id} className="card">
            <p className="font-medium">{b.name}</p>
            <p className="text-xs text-slate-500">
              {b.subject || "—"} · {b.schedule || "সময়সূচি নেই"}
            </p>
          </div>
        ))}
      </section>

      {/* হাজিরা */}
      <section className="space-y-2">
        <h2 className="font-bold">হাজিরা</h2>
        {batches.map((b) => {
          const recs = attendance.filter((a) => a.batch_id === b.id);
          const present = recs.filter((a) => a.status === "present").length;
          const pct = recs.length ? Math.round((present * 100) / recs.length) : 0;
          return (
            <div key={b.id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-slate-600">
                  {recs.length ? `${bn(pct)}% উপস্থিতি` : "এখনও হাজিরা নেই"}
                </p>
              </div>
              {recs.length > 0 && (
                <>
                  <p className="text-xs text-slate-500">
                    উপস্থিত {bn(present)} · অনুপস্থিত {bn(recs.length - present)} · মোট {bn(recs.length)} দিন
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {recs.slice(0, 14).map((a) => (
                      <span
                        key={`${a.batch_id}-${a.date}`}
                        title={a.status === "present" ? "উপস্থিত" : "অনুপস্থিত"}
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          a.status === "present"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {shortDate(a.date)} {a.status === "present" ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* ফি */}
      <section className="space-y-2">
        <h2 className="font-bold">ফি</h2>
        {batches.length > 0 && (
          <div
            className={`card ${dueTotal > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}
          >
            <p className="text-xs text-slate-600">এ মাসের ({month}) অবস্থা</p>
            {dueTotal > 0 ? (
              <p className="text-lg font-bold text-red-700">বকেয়া {taka(dueTotal)}</p>
            ) : (
              <p className="text-lg font-bold text-emerald-700">এ মাসের ফি পরিশোধিত ✓</p>
            )}
            <ul className="mt-2 space-y-1 text-sm">
              {thisMonth.map(({ batch, pay }) => (
                <li key={batch.id} className="flex justify-between">
                  <span>{batch.name}</span>
                  <span>{pay ? `পরিশোধিত ${taka(pay.amount)}` : `বকেয়া ${taka(batch.monthly_fee)}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card">
          <p className="mb-2 text-sm font-medium">পরিশোধের ইতিহাস ও রসিদ</p>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">এখনও কোনো পেমেন্ট নেই।</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <span>
                    {p.month} · {batchName(p.batch_id)}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{taka(p.amount)}</span>
                    <Link href={`/p/${token}/receipt/${p.id}`} className="text-indigo-600 hover:underline">
                      রসিদ
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* পরীক্ষা */}
      <section className="space-y-2">
        <h2 className="font-bold">পরীক্ষার নম্বর</h2>
        {results.length === 0 && <p className="text-sm text-slate-500">এখনও কোনো ফল নেই।</p>}
        {results.map((r) => (
          <div key={r.exam_id} className="card flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-slate-500">
                {batchName(r.batch_id)} · {r.exam_date || "তারিখ নেই"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-700">
                {bn(r.marks)}
                <span className="text-sm font-normal text-slate-500">/{bn(r.total_marks)}</span>
              </p>
              {r.class_avg != null && (
                <p className="text-xs text-slate-500">ক্লাসের গড় {bn(r.class_avg)}</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
