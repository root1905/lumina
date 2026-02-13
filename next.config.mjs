import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Service worker dosyalarını buraya çıkarır
  cacheOnFrontEndNav: true, // Sayfalar arası geçişte önbellek kullanır (Hız!)
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true, // İnternet gelince sayfayı yeniler
  swcMinify: true, // Kodu sıkıştırır
  disable: process.env.NODE_ENV === "development", // Geliştirme modunda PWA kapalı olsun (Hata ayıklama kolaylığı için)
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diğer Next.js ayarları buraya gelebilir
};

export default withPWA(nextConfig);