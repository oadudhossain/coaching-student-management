// ঢাকার সময় অনুযায়ী আজকের তারিখ (YYYY-MM-DD)
export const todayDhaka = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

// ঢাকার সময় অনুযায়ী বর্তমান মাস (YYYY-MM)
export const monthDhaka = () => todayDhaka().slice(0, 7);

export const taka = (n: number | string | null | undefined) =>
  `৳${Number(n ?? 0).toLocaleString("bn-BD")}`;

// বাংলা সংখ্যা
export const bn = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString("bn-BD");

export const rows = (res: { data: unknown }) => (res.data ?? []) as any[];

// নতুন লাইনে ভাগ করা টেক্সট → তালিকা
export const lines = (t?: string | null) =>
  (t ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// WhatsApp লিংক (বাংলাদেশি নম্বর 01XXXXXXXXX → 8801XXXXXXXXX)
export const waLink = (phone: string | null | undefined, text = "") => {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "88" + d;
  const base = d ? `https://wa.me/${d}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
