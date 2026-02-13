import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔴 KRİTİK DÜZELTME BURADA:
  // Next.js 16'nın PWA eklentisi yüzünden hata vermesini engelliyoruz.
  // Bu boş obje, "Webpack kullanmama izin ver" demektir.
  turbopack: {}, 
};

export default withPWA(nextConfig);