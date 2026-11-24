import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// হোম পেজ/ব্যাচ পেজের পাবলিক তথ্য (একই রিকোয়েস্টে একবারই কল হয়)
export const getPublicSite = cache(async (): Promise<any> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_site");
  return data ?? { configured: false };
});

// গোপন টোকেন দিয়ে একজন শিক্ষার্থীর পোর্টালের তথ্য
export const getPortal = cache(async (token: string): Promise<any | null> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_portal", { p_token: token });
  return data ?? null;
});
