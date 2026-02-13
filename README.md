# Lumina Pro: Professional Display & Audio Diagnostic Suite

Lumina Pro, modern ekran teknolojileri ve ses sistemleri için geliştirilmiş, tarayıcı tabanlı, yüksek performanslı bir teşhis ve kalibrasyon platformudur. Next.js 15 ve Web Audio API üzerine inşa edilen bu çözüm, donanım doğrulama süreçlerini tek bir çatı altında toplar.

---

## Technical Overview

Lumina Pro, sadece bir test aracı değil, aynı zamanda donanım sınırlarını zorlayan bir mühendislik çalışmasıdır.

### Key Modules

* **Advanced Display Diagnostics**: 10-bit renk derinliği testi, geometri ızgarası ve ölü piksel döngüsü.
* **Audio Lab Engine**: Web Audio API kullanarak sağ/sol kanal izolasyonu ve 20Hz-20kHz frekans taraması (sweep).
* **Motion Blur & Refresh Rate**: Monitörün gerçek Hz değerini doğrulayan ve ghosting/MPRT analizlerini yapan hareketli vektör motoru.
* **Digitizer Multi-Touch Mapping**: Dokunmatik ekranların ölü bölgelerini tespit etmek için geliştirilmiş, eşzamanlı çoklu dokunuş desteği sunan Canvas tabanlı haritalama.
* **Liquid Crystal Stimulus (Repair)**: Sıkışmış pikselleri uyandırmak için saniyede 60 kare hızında bitwise operasyonlarla üretilen yüksek hızlı beyaz gürültü (noise).

---

## Core Technologies

| Technology | Implementation |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) with Turbopack |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS with Glassmorphism patterns |
| **Animations** | Framer Motion (Hardware Accelerated) |
| **Audio** | Low-latency Web Audio API |
| **Performance** | Bitwise Canvas Rendering & RequestAnimationFrame |
| **Progressive Web App** | Workbox with aggressive caching for offline use |

---

## Getting Started

### Prerequisites

* Node.js 18.0 or higher
* npm, yarn, pnpm or bun

### Local Development

1.  **Clone the repository:**
    git clone https://github.com/root1905/lumina.git
    cd lumina

2.  **Install dependencies:**
    npm install

3.  **Run the development server:**
    npm run dev

4.  **Access the suite:**
    Navigate to http://localhost:3000.

---

## Deployment and Optimization

### Vercel Integration

Lumina Pro, Vercel Edge Network üzerinde optimize edilmiştir. Projenin dağıtımı için:

1.  GitHub deponuzu Vercel Dashboard'a bağlayın.
2.  NEXT_PUBLIC_GA_ID gibi ortam değişkenlerini yapılandırın.
3.  Deploy butonuna tıklayarak CI/CD hattını aktif edin.

### SEO & Performance

Proje, Google botları için tam uyumlu sitemap.xml ve robots.txt dosyalarını dinamik olarak oluşturur. Core Web Vitals metriklerinde 100/100 performans hedefiyle optimize edilmiştir.

---

## Authorship and Credits

* **Lead Developer**: root1905 
* **Organization**: Lemina Pro OS
* **Inspiration**: Professional Eizo and DisplayMate testing suites.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Lumina is a product of Lemina Pro OS.**
