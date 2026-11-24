import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicSite } from "@/lib/site";
import { bn, taka } from "@/lib/utils";

const rankLabel = (n: number) =>
  n === 1 ? "প্রথম" : n === 2 ? "দ্বিতীয়" : n === 3 ? "তৃতীয়" : `${bn(n)}তম`;

export default async function BatchPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getPublicSite();
  const batch = (site.batches ?? []).find((b: any) => b.id === id);
  if (!batch) notFound();

  const toppers = (site.toppers ?? []).filter((t: any) => t.batch_id === id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div>
        <Link href="/#batches" className="text-sm text-indigo-600 hover:underline">← সব ব্যাচ</Link>
        <h1 className="mt-2 text-2xl font-bold">{batch.name}</h1>
        <p className="text-slate-600">{batch.subject}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-slate-500">সময়সূচি</p>
          <p className="mt-1 font-medium">{batch.schedule || "শিগগিরই জানানো হবে"}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">শিক্ষার্থী</p>
          <p className="mt-1 text-xl font-bold">{bn(batch.students)} জন</p>
        </div>
        {batch.fee != null && (
          <div className="card">
            <p className="text-xs text-slate-500">মাসিক ফি</p>
            <p className="mt-1 text-xl font-bold">{taka(batch.fee)}</p>
          </div>
        )}
      </div>

      {batch.description && (
        <section className="space-y-2">
          <h2 className="font-bold">ব্যাচ সম্পর্কে</h2>
          <p className="whitespace-pre-line text-slate-700">{batch.description}</p>
        </section>
      )}

      {toppers.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">এই ব্যাচের কৃতী শিক্ষার্থী</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {toppers.map((t: any) => (
              <div key={t.id} className="card space-y-1 text-center">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.student_name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-400">
                    {String(t.student_name).slice(0, 1)}
                  </div>
                )}
                <p className="text-xs text-amber-700">{rankLabel(t.rank_no)} স্থান</p>
                <p className="font-bold">{t.student_name}</p>
                <p className="text-lg font-bold text-indigo-700">
                  {bn(t.marks)}/{bn(t.total_marks)}
                </p>
                <p className="text-xs text-slate-500">{t.exam_title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/apply?batch=${batch.id}`} className="btn">এই ব্যাচে ভর্তির আবেদন</Link>
        {user && (
          <Link href="/batches" className="btn-ghost">অ্যাডমিনে ব্যাচ ম্যানেজ করুন</Link>
        )}
      </div>
    </main>
  );
}
