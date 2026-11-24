import { getCenter } from "@/lib/center";
import { saveSettings } from "./actions";

export default async function SettingsPage() {
  const center = await getCenter();

  return (
    <div className="space-y-4">
      <h1 className="h1">কোচিং সেন্টারের তথ্য</h1>

      <form action={saveSettings} className="card space-y-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.logo_url} alt="বর্তমান লোগো" className="h-20 w-20 rounded-lg border border-slate-200 object-contain p-1" />
          <div className="flex-1">
            <label className="label" htmlFor="logo">লোগো (PNG/JPG/SVG, সর্বোচ্চ ১ MB)</label>
            <input id="logo" name="logo" type="file" accept="image/*" className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">কোচিং সেন্টারের নাম</label>
          <input id="name" name="name" defaultValue={center.name} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="address">ঠিকানা</label>
          <textarea id="address" name="address" defaultValue={center.address} rows={2} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">ফোন নম্বর</label>
          <input id="phone" name="phone" defaultValue={center.phone} className="input" />
        </div>

        <button className="btn">সংরক্ষণ করুন</button>
      </form>
    </div>
  );
}
