import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicSite } from "@/lib/site";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    site,
  ] = await Promise.all([supabase.auth.getUser(), getPublicSite()]);

  const center = site.center ?? {};
  const name = center.name || "কোচিং ম্যানেজার";
  const logo = center.logo_url || "/icon.svg";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="লোগো" className="h-9 w-9 rounded-md object-contain" />
            <span className="truncate font-bold">{name}</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
            <Link href="/#batches" className="hover:text-indigo-700">ব্যাচ</Link>
            <Link href="/#results" className="hover:text-indigo-700">কৃতী শিক্ষার্থী</Link>
            <Link href="/#gallery" className="hover:text-indigo-700">গ্যালারি</Link>
            <Link href="/#contact" className="hover:text-indigo-700">যোগাযোগ</Link>
          </nav>
          <Link href="/apply" className="btn">ভর্তি হোন</Link>
          {user ? (
            <Link href="/dashboard" className="btn-ghost">ড্যাশবোর্ড</Link>
          ) : (
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">লগইন</Link>
          )}
        </div>
      </header>

      {children}

      <footer className="mt-16 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500">
          <span>© {name}</span>
          {!user && <Link href="/login" className="hover:text-indigo-700">অ্যাডমিন লগইন</Link>}
        </div>
      </footer>
    </div>
  );
}
