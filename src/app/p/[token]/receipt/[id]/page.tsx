import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { getPortal } from "@/lib/site";
import { taka } from "@/lib/utils";

export default async function PortalReceiptPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = await params;
  const data = await getPortal(token);
  if (!data) notFound();

  const pay = (data.payments ?? []).find((p: any) => p.id === id);
  if (!pay) notFound();

  const center = data.center ?? {};
  const batch = (data.batches ?? []).find((b: any) => b.id === pay.batch_id);
  const paidAt = new Date(pay.paid_at).toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href={`/p/${token}`} className="text-sm text-indigo-600 hover:underline print:hidden">
        ← পোর্টালে ফিরুন
      </Link>

      <div className="card space-y-4 print:border-0 print:shadow-none">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.logo_url || "/icon.svg"} alt="লোগো" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-lg font-bold leading-tight">{center.name}</p>
            {center.address && <p className="text-xs text-slate-600">{center.address}</p>}
            {center.phone && <p className="text-xs text-slate-600">ফোন: {center.phone}</p>}
          </div>
        </div>

        <h1 className="text-center text-base font-bold">ফি আদায়ের রসিদ</h1>

        <dl className="space-y-2 text-sm">
          <Row label="শিক্ষার্থী" value={data.student?.name} />
          <Row label="ব্যাচ" value={batch?.name ?? "—"} />
          <Row label="মাস" value={pay.month} />
          <Row label="টাকার পরিমাণ" value={taka(pay.amount)} />
          <Row label="তারিখ" value={paidAt} />
          <Row label="রসিদ নং" value={String(pay.id).slice(0, 8).toUpperCase()} />
        </dl>

        <p className="pt-6 text-right text-xs text-slate-500">কর্তৃপক্ষের স্বাক্ষর</p>
      </div>
      <PrintButton />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
