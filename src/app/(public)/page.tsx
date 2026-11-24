import Link from "next/link";
import { getPublicSite } from "@/lib/site";
import { bn, lines, taka, waLink } from "@/lib/utils";

const rankLabel = (n: number) =>
  n === 1 ? "প্রথম" : n === 2 ? "দ্বিতীয়" : n === 3 ? "তৃতীয়" : `${bn(n)}তম`;

export default async function HomePage() {
  const site = await getPublicSite();

  if (!site.configured) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">ওয়েবসাইট এখনও সাজানো হয়নি</h1>
        <p className="mt-3 text-sm text-slate-600">
          অ্যাডমিন হিসেবে লগইন করে "সেটিংস" ও "ওয়েবসাইট" পেজে তথ্য দিন। (Supabase-এ
          002_portal_site.sql চালানো হয়েছে কিনা তাও দেখে নিন।)
        </p>
        <Link href="/login" className="btn mt-6">অ্যাডমিন লগইন</Link>
      </section>
    );
  }

  const c = site.center ?? {};
  const s = site.site ?? {};
  const batches: any[] = site.batches ?? [];
  const toppers: any[] = site.toppers ?? [];
  const gallery: any[] = site.gallery ?? [];
  const quals = lines(s.qualifications);
  const admission = lines(s.admission_info);
  const teacherName = s.teacher_name || c.name;
  const mapEmbed =
    typeof s.map_url === "string" &&
    s.map_url.startsWith("https://www.google.com/maps/embed")
      ? s.map_url
      : null;

  return (
    <main>
      {/* হিরো */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="space-y-4">
            {s.teacher_title && (
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                {s.teacher_title}
              </span>
            )}
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {s.hero_headline || `${c.name || "আমাদের কোচিং সেন্টারে"} স্বাগতম`}
            </h1>
            {s.hero_subtitle && <p className="text-slate-600">{s.hero_subtitle}</p>}
            <p className="text-sm font-medium text-slate-800">{teacherName}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/apply" className="btn">অনলাইনে ভর্তির আবেদন</Link>
              <Link href="/#batches" className="btn-ghost">সব ব্যাচ দেখুন</Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                <p className="text-xl font-bold text-indigo-700">{bn(site.stats?.students)}+</p>
                <p className="text-xs text-slate-500">শিক্ষার্থী</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                <p className="text-xl font-bold text-indigo-700">{bn(site.stats?.batches)}</p>
                <p className="text-xs text-slate-500">ব্যাচ</p>
              </div>
              {s.experience_years ? (
                <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                  <p className="text-xl font-bold text-indigo-700">{bn(s.experience_years)} বছর</p>
                  <p className="text-xs text-slate-500">অভিজ্ঞতা</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center">
            {s.teacher_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.teacher_photo_url}
                alt={teacherName}
                className="h-72 w-72 rounded-3xl object-cover shadow-lg md:h-96 md:w-96"
              />
            ) : (
              <div className="flex h-72 w-72 items-center justify-center rounded-3xl bg-indigo-100 text-6xl font-bold text-indigo-400 md:h-96 md:w-96">
                {String(teacherName || "ক").slice(0, 1)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* শিক্ষক পরিচিতি */}
      {(s.teacher_bio || quals.length > 0 || s.about) && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">শিক্ষক পরিচিতি</h2>
              {s.teacher_bio && <p className="whitespace-pre-line text-slate-700">{s.teacher_bio}</p>}
              {quals.length > 0 && (
                <ul className="space-y-1 text-sm text-slate-700">
                  {quals.map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {s.about && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">কোচিং সম্পর্কে</h2>
                <p className="whitespace-pre-line text-slate-700">{s.about}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ব্যাচ */}
      <section id="batches" className="bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-6 text-xl font-bold">আমাদের ব্যাচসমূহ</h2>
          {batches.length === 0 ? (
            <p className="text-sm text-slate-500">শিগগিরই ব্যাচের তথ্য যোগ করা হবে।</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((b) => (
                <div key={b.id} className="card flex flex-col gap-2">
                  <h3 className="font-bold">{b.name}</h3>
                  <p className="text-sm text-slate-600">{b.subject || "—"}</p>
                  {b.schedule && <p className="text-xs text-slate-500">🕒 {b.schedule}</p>}
                  {b.description && (
                    <p className="line-clamp-3 text-sm text-slate-600">{b.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{bn(b.students)} জন শিক্ষার্থী</span>
                    {b.fee != null && <span>মাসিক {taka(b.fee)}</span>}
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Link href={`/batch/${b.id}`} className="btn flex-1">ব্যাচ ড্যাশবোর্ড</Link>
                    <Link href={`/apply?batch=${b.id}`} className="btn-ghost">ভর্তি</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* কৃতী শিক্ষার্থী */}
      {toppers.length > 0 && (
        <section id="results" className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-6 text-xl font-bold">কৃতী শিক্ষার্থী</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {toppers.map((t) => (
              <div key={t.id} className="card space-y-1 text-center">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.student_name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-400">
                    {String(t.student_name).slice(0, 1)}
                  </div>
                )}
                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {rankLabel(t.rank_no)} স্থান
                </span>
                <p className="font-bold">{t.student_name}</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {bn(t.marks)}
                  <span className="text-sm font-normal text-slate-500">/{bn(t.total_marks)}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {t.exam_title} · {t.batch_name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* গ্যালারি */}
      {gallery.length > 0 && (
        <section id="gallery" className="bg-slate-50 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-6 text-xl font-bold">গ্যালারি</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((g) => (
                <figure key={g.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={g.caption ?? "গ্যালারি"} className="h-40 w-full object-cover" />
                  {g.caption && (
                    <figcaption className="p-2 text-xs text-slate-600">{g.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ভর্তির তথ্য */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-2xl bg-indigo-600 p-6 text-white md:p-10">
          <h2 className="text-xl font-bold">ভর্তি চলছে</h2>
          {admission.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-indigo-50">
              {admission.map((a) => (
                <li key={a} className="flex gap-2">
                  <span>•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/apply"
            className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            অনলাইনে আবেদন করুন
          </Link>
        </div>
      </section>

      {/* যোগাযোগ */}
      <section id="contact" className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-xl font-bold">যোগাযোগ</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-2 text-sm text-slate-700">
            {c.address && <li>📍 {c.address}</li>}
            {c.phone && (
              <li>
                📞 <a href={`tel:${String(c.phone).replace(/\s/g, "")}`} className="text-indigo-700 hover:underline">{c.phone}</a>
              </li>
            )}
            {s.whatsapp && (
              <li>
                💬 <a href={waLink(s.whatsapp)} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">WhatsApp: {s.whatsapp}</a>
              </li>
            )}
            {s.email && (
              <li>
                ✉️ <a href={`mailto:${s.email}`} className="text-indigo-700 hover:underline">{s.email}</a>
              </li>
            )}
            {s.facebook_url && (
              <li>
                🔗 <a href={s.facebook_url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">ফেসবুক পেজ</a>
              </li>
            )}
            {s.office_hours && <li>🕒 {s.office_hours}</li>}
          </ul>
          {mapEmbed && (
            <iframe
              src={mapEmbed}
              title="ম্যাপ"
              className="h-60 w-full rounded-xl border border-slate-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </section>
    </main>
  );
}
