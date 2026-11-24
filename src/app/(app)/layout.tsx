import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCenter } from "@/lib/center";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const links: [string, string][] = [
  ["/dashboard", "ড্যাশবোর্ড"],
  ["/students", "শিক্ষার্থী"],
  ["/batches", "ব্যাচ"],
  ["/attendance", "হাজিরা"],
  ["/fees", "ফি"],
  ["/exams", "পরীক্ষা"],
  ["/site", "ওয়েবসাইট"],
  ["/settings", "সেটিংস"],
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [center, pendingRes] = await Promise.all([
    getCenter(),
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  const pending = pendingRes.count ?? 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.logo_url} alt="লোগো" className="h-10 w-10 rounded-md object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold leading-tight">{center.name}</p>
            {center.address && (
              <p className="truncate text-xs text-slate-500">{center.address}</p>
            )}
          </div>
          <Link href="/" target="_blank" className="btn-ghost hidden sm:inline-flex">
            সাইট দেখুন ↗
          </Link>
          <form action={signOut}>
            <button className="btn-ghost">লগআউট</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-3 pb-2">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {label}
              {href === "/students" && pending > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">
                  {pending.toLocaleString("bn-BD")}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-5">{children}</main>
    </div>
  );
}
