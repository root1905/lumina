import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lumina-4813.vercel.app/'; // Kendi Vercel linkinle değiştir!

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // İleride 'Hakkımızda' veya 'Blog' eklersek buraya ekleyeceğiz.
  ];
}