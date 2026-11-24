import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCenter } from "@/lib/center";

async function signIn(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect("/login?error=1");
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const center = await getCenter();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <form action={signIn} className="card w-full space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.logo_url} alt="লোগো" className="h-16 w-16 rounded-lg object-contain" />
          <h1 className="text-xl font-bold">{center.name}</h1>
          {center.address && <p className="text-xs text-slate-500">{center.address}</p>}
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
            ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।
          </p>
        )}
        <div>
          <label className="label" htmlFor="email">ইমেইল</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">পাসওয়ার্ড</label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        <button className="btn w-full">লগইন</button>
      </form>
    </main>
  );
}
