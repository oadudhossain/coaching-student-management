import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCenter } from "@/lib/center";
import PrintButton from "@/components/PrintButton";
import { taka } from "@/lib/utils";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select("*, students(name), batches(name, subject)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const pay = data as any;
  const center = await getCenter();

  const paidAt = new Date(pay.paid_at).toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="card space-y-4 print:border-0 print:shadow-none">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.logo_url} alt="লোগো" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-lg font-bold leading-tight">{center.name}</p>
            {center.address && <p className="text-xs text-slate-600">{center.address}</p>}
            {center.phone && <p className="text-xs text-slate-600">ফোন: {center.phone}</p>}
          </div>
        </div>

        <h1 className="text-center text-base font-bold">ফি আদায়ের রসিদ</h1>

        <dl className="space-y-2 text-sm">
          <Row label="শিক্ষার্থী" value={pay.students?.name} />
          <Row label="ব্যাচ" value={pay.batches?.name} />
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
