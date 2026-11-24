import { createClient } from "@/lib/supabase/server";

export type Center = {
  name: string;
  address: string;
  phone: string;
  logo_url: string;
};

export async function getCenter(): Promise<Center> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("center_settings")
    .select("name,address,phone,logo_url")
    .limit(1)
    .maybeSingle();

  return {
    name: data?.name || "কোচিং ম্যানেজার",
    address: data?.address || "",
    phone: data?.phone || "",
    logo_url: data?.logo_url || "/icon.svg",
  };
}
