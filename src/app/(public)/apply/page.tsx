import Link from "next/link";
import { getPublicSite } from "@/lib/site";
import { submitApplication } from "./actions";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; batch?: string }>;
}) {
  const sp = await searchParams;
  const site = await getPublicSite();
  const batches: any[] = site.batches ?? [];

  if (sp.ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="card space-y-3">
          <p className="text-4xl">✅</p>
          <h1 className="text-xl font-bold">আবেদন জমা হয়েছে</h1>
          <p className="text-sm text-slate-600">
            ধন্যবাদ! আমরা শিগগিরই আপনার সাথে যোগাযোগ করব।
          </p>
          <Link href="/" className="btn">হোম পেজে ফিরুন</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">অনলাইনে ভর্তির আবেদন</h1>
      <p className="mb-5 text-sm text-slate-600">ফর্মটি পূরণ করুন। আমরা যোগাযোগ করে ভর্তি নিশ্চিত করব।</p>

      {sp.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          আবেদন জমা হয়নি। নাম ও মোবাইল নম্বর ঠিকভাবে দিয়ে আবার চেষ্টা করুন।
        </p>
      )}

      <form action={submitApplication} className="card space-y-4">
        {/* হানিপট: মানুষ এটা দেখবে না */}
        <div className="hidden" aria-hidden="true">
          <label>Website</label>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="label" htmlFor="name">শিক্ষার্থীর নাম *</label>
          <input id="name" name="name" required minLength={2} maxLength={100} className="input" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">মোবাইল নম্বর *</label>
            <input id="phone" name="phone" required inputMode="tel" maxLength={20} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="class_level">শ্রেণি</label>
            <input id="class_level" name="class_level" maxLength={50} placeholder="যেমন: নবম" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="guardian_name">অভিভাবকের নাম</label>
            <input id="guardian_name" name="guardian_name" maxLength={100} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="guardian_phone">অভিভাবকের মোবাইল</label>
            <input id="guardian_phone" name="guardian_phone" inputMode="tel" maxLength={20} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="batch_id">কোন ব্যাচে ভর্তি হতে চান?</label>
          <select id="batch_id" name="batch_id" defaultValue={sp.batch ?? ""} className="input">
            <option value="">এখনও ঠিক করিনি</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.subject ? ` (${b.subject})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="message">কিছু জানাতে চাইলে</label>
          <textarea id="message" name="message" rows={3} maxLength={500} className="input" />
        </div>
        <button className="btn w-full">আবেদন জমা দিন</button>
      </form>
    </main>
  );
}
