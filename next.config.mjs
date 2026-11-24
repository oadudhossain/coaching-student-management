/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // ছবি আপলোডের জন্য (Vercel-এ একটি রিকোয়েস্টের সীমা প্রায় ৪.৫ MB)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
