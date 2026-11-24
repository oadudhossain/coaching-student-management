import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import CopyButton from "@/components/CopyButton";
import { rows, waLink } from "@/lib/utils";
import {
  addStudent,
  approveStudent,
  deleteStudent,
  regenerateLink,
  toggleStudent,
} from "./actions";

export default async function StudentsPage() {
  const supabase = await createClient();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const all = rows(
    await supabase
      .from("students")
      .select("*, batches!applied_batch_id(name)")
      .order("name")
  );
  const pending = all.filter((s) => s.status === "pending");
  const students = all.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-5">
      <h1 className="h1">শিক্ষার্থী</h1>

      {pending.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-amber-700">
            অপেক্ষমাণ ভর্তির আবেদন ({pending.length})
          </h2>
          {pending.map((s) => (
            <div key={s.id} className="card space-y-2 border-amber-300 bg-amber-50">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-slate-600">
                    মোবাইল: {s.phone || "—"} · অভিভাবক: {s.guardian_name || "—"} (
                    {s.guardian_phone || "—"}) · শ্রেণি: {s.class_level || "—"}
                  </p>
                  <p className="text-xs text-slate-600">
                    আবেদনের ব্যাচ: {s.batches?.name || "নির্দিষ্ট নয়"}
                  </p>
                  {s.note && <p className="mt-1 text-xs text-slate-700">বার্তা: {s.note}</p>}
                </div>
                <form action={approveStudent}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="applied_batch_id" value={s.applied_batch_id ?? ""} />
                  <button className="btn">অনুমোদন</button>
                </form>
                <form action={deleteStudent}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton className="btn-danger" message="এই আবেদন বাতিল করবেন?">
                    বাতিল
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </section>
      )}

      <form action={addStudent} className="card grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">নাম</label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">মোবাইল</label>
          <input id="phone" name="phone" inputMode="tel" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="guardian_phone">অভিভাবকের মোবাইল</label>
          <input id="guardian_phone" name="guardian_phone" inputMode="tel" className="input" />
        </div>
        <div className="sm:col-span-4">
          <button className="btn">শিক্ষার্থী যোগ করুন</button>
        </div>
      </form>

      <div className="space-y-2">
        {students.length === 0 && (
          <p className="text-sm text-slate-500">এখনও কোনো শিক্ষার্থী নেই।</p>
        )}
        {students.map((s) => {
          const link = `${origin}/p/${s.portal_token}`;
          const message = `${s.name}-এর হাজিরা, ফি ও পরীক্ষার ফল দেখার লিংক: ${link}`;
          return (
            <div key={s.id} className="card space-y-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {s.name}
                    {s.status === "inactive" && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.phone || "—"} · অভিভাবক: {s.guardian_phone || "—"}
                  </p>
                </div>
                <form action={toggleStudent}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value={s.status} />
                  <button className="btn-ghost">
                    {s.status === "active" ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                  </button>
                </form>
                <form action={deleteStudent}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton
                    className="btn-danger"
                    message="এই শিক্ষার্থী ও তার হাজিরা, ফি, নম্বর সব মুছে যাবে। নিশ্চিত?"
                  >
                    মুছুন
                  </ConfirmButton>
                </form>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">অভিভাবক পোর্টাল:</span>
                <CopyButton text={link} />
                <a
                  className="btn-ghost"
                  href={waLink(s.guardian_phone || s.phone, message)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp-এ পাঠান
                </a>
                <a className="btn-ghost" href={link} target="_blank" rel="noreferrer">
                  খুলুন
                </a>
                <form action={regenerateLink}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton
                    className="btn-danger"
                    message="নতুন লিংক বানালে পুরনো লিংক আর কাজ করবে না। নিশ্চিত?"
                  >
                    লিংক বদলান
                  </ConfirmButton>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
