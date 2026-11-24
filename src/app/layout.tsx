import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "কোচিং ম্যানেজার",
  description: "কোচিং সেন্টারের শিক্ষার্থী, হাজিরা, ফি ও পরীক্ষা ব্যবস্থাপনা",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={`${font.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
