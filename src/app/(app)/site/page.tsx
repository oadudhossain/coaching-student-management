import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import { rows } from "@/lib/utils";
import { addGalleryImages, deleteGalleryImage, removeFeatured, saveSite } from "./actions";

export default async function SitePage() {
  const supabase = await createClient();

  const [siteRes, galleryRes, featuredRes] = await Promise.all([
    supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
    supabase
      .from("featured_results")
      .select("*, students(name), exams(title)")
      .order("created_at", { ascending: false }),
  ]);

  const s = (siteRes.data ?? {}) as any;
  const gallery = rows(galleryRes);
  const featured = rows(featuredRes);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="h1 mb-0 flex-1">পাবলিক ওয়েবসাইট</h1>
        <Link href="/" target="_blank" className="btn-ghost">সাইট দেখুন ↗</Link>
      </div>
      <p className="text-sm text-slate-500">
        কোচিং সেন্টারের নাম, লোগো, ঠিকানা ও ফোন নম্বর বদলাতে "সেটিংস" পেজে যান।
      </p>

      <form action={saveSite} className="card space-y-4">
        <h2 className="font-bold">শিক্ষকের পরিচিতি (হিরো সেকশন)</h2>

        <div className="flex items-center gap-4">
          {s.teacher_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.teacher_photo_url} alt="শিক্ষকের ছবি" className="h-24 w-24 rounded-xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
              ছবি নেই
            </div>
          )}
          <div className="flex-1">
            <label className="label" htmlFor="teacher_photo">শিক্ষকের ছবি (সর্বোচ্চ ১.৫ MB)</label>
            <input id="teacher_photo" name="teacher_photo" type="file" accept="image/*" className="input" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="teacher_name">শিক্ষকের নাম</label>
            <input id="teacher_name" name="teacher_name" defaultValue={s.teacher_name ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="teacher_title">পদবি/পরিচিতি</label>
            <input id="teacher_title" name="teacher_title" defaultValue={s.teacher_title ?? ""} placeholder="যেমন: গণিত ও পদার্থবিজ্ঞান শিক্ষক" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="hero_headline">হিরো শিরোনাম</label>
            <input id="hero_headline" name="hero_headline" defaultValue={s.hero_headline ?? ""} placeholder="যেমন: সঠিক গাইডেন্সে সাফল্যের পথে" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="hero_subtitle">হিরো উপশিরোনাম</label>
            <input id="hero_subtitle" name="hero_subtitle" defaultValue={s.hero_subtitle ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="experience_years">অভিজ্ঞতা (বছর)</label>
            <input id="experience_years" name="experience_years" type="number" min="0" defaultValue={s.experience_years ?? ""} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="teacher_bio">শিক্ষকের সংক্ষিপ্ত পরিচিতি</label>
          <textarea id="teacher_bio" name="teacher_bio" rows={4} defaultValue={s.teacher_bio ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="qualifications">শিক্ষাগত যোগ্যতা/অর্জন (প্রতি লাইনে একটি)</label>
          <textarea id="qualifications" name="qualifications" rows={3} defaultValue={s.qualifications ?? ""} className="input" />
        </div>

        <h2 className="pt-2 font-bold">কোচিং সম্পর্কে ও ভর্তির তথ্য</h2>
        <div>
          <label className="label" htmlFor="about">কোচিং সম্পর্কে</label>
          <textarea id="about" name="about" rows={4} defaultValue={s.about ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="admission_info">ভর্তির নিয়মাবলি/তথ্য (প্রতি লাইনে একটি পয়েন্ট)</label>
          <textarea id="admission_info" name="admission_info" rows={4} defaultValue={s.admission_info ?? ""} className="input" />
        </div>

        <h2 className="pt-2 font-bold">যোগাযোগ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="whatsapp">WhatsApp নম্বর</label>
            <input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={s.whatsapp ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">ইমেইল</label>
            <input id="email" name="email" type="email" defaultValue={s.email ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="facebook_url">ফেসবুক পেজের লিংক</label>
            <input id="facebook_url" name="facebook_url" defaultValue={s.facebook_url ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="office_hours">যোগাযোগের সময়</label>
            <input id="office_hours" name="office_hours" defaultValue={s.office_hours ?? ""} placeholder="শনি–বৃহস্পতি, সকাল ৯টা–রাত ৮টা" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="map_url">
              Google Maps এম্বেড লিংক (Maps → Share → Embed a map → src="…" এর ভেতরের লিংক)
            </label>
            <input id="map_url" name="map_url" defaultValue={s.map_url ?? ""} placeholder="https://www.google.com/maps/embed?pb=..." className="input" />
          </div>
        </div>

        <button className="btn">সংরক্ষণ করুন</button>
      </form>

      <section className="card space-y-4">
        <h2 className="font-bold">গ্যালারির ছবি</h2>
        <form action={addGalleryImages} className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="images">ছবি বেছে নিন (একবারে সর্বোচ্চ ৩টি, প্রতিটি ১.৫ MB-এর কম)</label>
            <input id="images" name="images" type="file" accept="image/*" multiple className="input" />
          </div>
          <div>
            <label className="label" htmlFor="caption">ক্যাপশন (ঐচ্ছিক)</label>
            <input id="caption" name="caption" className="input" />
          </div>
          <div className="sm:col-span-3">
            <button className="btn">ছবি যোগ করুন</button>
          </div>
        </form>

        {gallery.length === 0 ? (
          <p className="text-sm text-slate-500">এখনও কোনো ছবি নেই।</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g) => (
              <div key={g.id} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt={g.caption ?? "গ্যালারি"} className="h-28 w-full rounded-lg object-cover" />
                <p className="truncate text-xs text-slate-500">{g.caption || " "}</p>
                <form action={deleteGalleryImage}>
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton className="btn-danger" message="ছবিটি মুছে ফেলবেন?">মুছুন</ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">হোম পেজে দেখানো কৃতী শিক্ষার্থী</h2>
        <p className="text-xs text-slate-500">
          নতুন টপার যোগ করতে "পরীক্ষা" → পরীক্ষা বেছে নিয়ে নম্বর সংরক্ষণ করুন, তারপর নিচের "হোম পেজে দিন" ব্যবহার করুন।
        </p>
        {featured.length === 0 && <p className="text-sm text-slate-500">এখনও কেউ নেই।</p>}
        <ul className="divide-y divide-slate-100 text-sm">
          {featured.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2">
              {f.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-100" />
              )}
              <span className="flex-1">
                {f.students?.name} · {f.exams?.title} · {f.marks}/{f.total_marks}
              </span>
              <form action={removeFeatured}>
                <input type="hidden" name="id" value={f.id} />
                <ConfirmButton className="btn-danger" message="হোম পেজ থেকে সরাবেন?">সরান</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
