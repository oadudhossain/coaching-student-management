import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortal } from "@/lib/site";
import { UUID_RE } from "@/lib/utils";

// গোপন লিংক: সার্চ ইঞ্জিনে ইনডেক্স হবে না
export const metadata: Metadata = {
  title: "শিক্ষার্থী পোর্টাল",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = UUID_RE.test(token) ? await getPortal(token) : null;
  if (!data) notFound();

  const center = data.center ?? {};

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={center.logo_url || "/icon.svg"}
            alt="লোগো"
            className="h-10 w-10 rounded-md object-contain"
          />
          <div className="min-w-0">
            <p className="truncate font-bold leading-tight">{center.name || "কোচিং সেন্টার"}</p>
            {center.address && (
              <p className="truncate text-xs text-slate-500">{center.address}</p>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
      <footer className="mx-auto max-w-2xl px-4 pb-8 text-center text-xs text-slate-400 print:hidden">
        এই লিংকটি গোপন রাখুন। এটি শুধু দেখার জন্য; এখান থেকে কিছু বদলানো যায় না।
      </footer>
    </div>
  );
}
