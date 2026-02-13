"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, Minimize, Play, Pause, Info, 
  Palette, Grid3X3, Layers, Type, Zap, Globe, X 
} from "lucide-react";
import { clsx } from "clsx";

// --- DİL PAKETİ (Localization) ---
const TRANSLATIONS = {
  en: {
    title: "Lumina Pro",
    modes: {
      color: "Dead Pixel",
      grid: "Geometry",
      gradient: "Banding",
      text: "Sharpness",
      repair: "Burn-in Fix"
    },
    colors: { white: "White", black: "Black", red: "Red", green: "Green", blue: "Blue" },
    guide: {
      title: "User Guide & Information",
      p1: "Lumina Pro is a diagnostic tool designed for display calibration.",
      features: [
        "Dead Pixel Test: Cycle through solid colors to find stuck pixels.",
        "Burn-in Fix: Use the 'Repair' mode (Noise) for 10-30 mins to stimulate stuck liquid crystals.",
        "Geometry: Check screen alignment and aspect ratio.",
        "Banding: Analyze 8-bit vs 10-bit color gradients."
      ],
      tip: "Double tap anywhere to toggle controls."
    }
  },
  tr: {
    title: "Lumina Pro",
    modes: {
      color: "Ölü Piksel",
      grid: "Geometri",
      gradient: "Gradyan",
      text: "Keskinlik",
      repair: "Tamir Modu"
    },
    colors: { white: "Beyaz", black: "Siyah", red: "Kırmızı", green: "Yeşil", blue: "Mavi" },
    guide: {
      title: "Kullanım Kılavuzu",
      p1: "Lumina Pro, ekran kalibrasyonu ve teşhisi için tasarlanmış profesyonel bir araçtır.",
      features: [
        "Ölü Piksel Testi: Sıkışmış pikselleri bulmak için renkleri gezdirin.",
        "Tamir Modu: 'Gürültü' efektini 10-30 dk çalıştırarak ekran yanıklarını (ghosting) giderin.",
        "Geometri: Ekran hizalamasını ve yamuklukları kontrol edin.",
        "Gradyan: Renk geçişlerindeki kırılmaları analiz edin."
      ],
      tip: "Kontrolleri açıp kapatmak için ekrana çift tıklayın."
    }
  }
};

// --- VERİ SABİTLERİ ---
const COLORS = [
  { value: "#FFFFFF", label: "white" },
  { value: "#000000", label: "black" },
  { value: "#FF0000", label: "red" },
  { value: "#00FF00", label: "green" },
  { value: "#0000FF", label: "blue" },
];

const MODES = [
  { id: "color", icon: Palette },
  { id: "repair", icon: Zap }, // YENİ MOD
  { id: "grid", icon: Grid3X3 },
  { id: "gradient", icon: Layers },
  { id: "text", icon: Type },
];

export default function Page() {
  // State
  const [lang, setLang] = useState<"en" | "tr">("en");
  const [mode, setMode] = useState<"color" | "grid" | "gradient" | "text" | "repair">("color");
  const [colorIndex, setColorIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const t = TRANSLATIONS[lang]; // Aktif dil verisi
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- WAKE LOCK & UI GİZLEME ---
  useEffect(() => {
    const handleActivity = () => {
      setShowUI(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => !showInfo && setShowUI(false), 3000);
    };
    
    // Tarayıcı dili algılama
    const browserLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(browserLang);

    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {});

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity); // Tek tık sadece UI resetler
    window.addEventListener("dblclick", () => setShowUI(prev => !prev)); // Çift tık UI gizler/açar

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [showInfo]);

  // --- NOISE EFFECT (Tamir Modu) ---
  useEffect(() => {
    let animId: number;
    if (mode === "repair" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      const drawNoise = () => {
        if (!ctx) return;
        const w = canvas.width = window.innerWidth / 2; // Performans için düşük çözünürlük
        const h = canvas.height = window.innerHeight / 2;
        const idata = ctx.createImageData(w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        
        for (let i = 0; i < buffer32.length; i++) {
          // Rastgele siyah/beyaz piksel
          buffer32[i] = Math.random() < 0.5 ? 0xFF000000 : 0xFFFFFFFF;
        }
        ctx.putImageData(idata, 0, 0);
        animId = requestAnimationFrame(drawNoise);
      };
      drawNoise();
    }
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  // --- OTOMATİK DÖNGÜ ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && mode === "color") {
      interval = setInterval(() => setColorIndex((p) => (p + 1) % COLORS.length), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      
      {/* --- GÖRSEL ALAN --- */}
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: mode === "color" ? COLORS[colorIndex].value : "#000" }}
      >
        {mode === "repair" && (
           <canvas ref={canvasRef} className="w-full h-full opacity-90 image-rendering-pixelated" />
        )}

        {mode === "grid" && (
          <div className="w-full h-full grid grid-cols-12 grid-rows-6 border border-white/20">
             {[...Array(72)].map((_, i) => (
                <div key={i} className="border border-white/10 flex items-center justify-center">
                   {i === 30 && <div className="w-2 h-2 bg-red-500 rounded-full"/>}
                </div>
             ))}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80vmin] h-[80vmin] border border-white/30 rounded-full"></div>
             </div>
          </div>
        )}

        {mode === "gradient" && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-gradient-to-r from-black via-gray-500 to-white"/>
            <div className="flex-1 bg-gradient-to-r from-red-900 via-red-500 to-red-100"/>
            <div className="flex-1 bg-gradient-to-r from-green-900 via-green-500 to-green-100"/>
            <div className="flex-1 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-100"/>
          </div>
        )}

        {mode === "text" && (
          <div className="bg-white text-black p-10 flex flex-col gap-6 items-center justify-center w-full h-full">
            <h1 className="text-5xl font-bold tracking-tighter">Lumina Readability Test</h1>
            <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
               <div className="border p-2">10px Font Size</div>
               <div className="border p-2 font-bold">Bold Text Test</div>
            </div>
          </div>
        )}
      </div>

      {/* --- KONTROL PANELİ (DOCK) --- */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-2 shadow-2xl">
              
              {/* Üst Sıra: Modlar */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id as any); setIsPlaying(false); }}
                    className={clsx(
                      "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-all",
                      mode === m.id ? "bg-white text-black shadow-lg" : "text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <m.icon size={20} />
                    <span className="text-[9px] uppercase font-bold tracking-wider">
                      {(t.modes as any)[m.id]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Alt Sıra: Araçlar */}
              <div className="flex items-center justify-between px-2 pb-1">
                {/* Sol: Renkler (Sadece Color Modu) */}
                <div className="flex gap-2">
                  {mode === "color" && COLORS.map((c, i) => (
                    <button
                      key={c.label}
                      onClick={() => { setIsPlaying(false); setColorIndex(i); }}
                      className={clsx(
                        "w-5 h-5 rounded-full border transition-transform",
                        colorIndex === i ? "border-white scale-125" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  {mode === "color" && (
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={clsx("ml-2 transition-colors", isPlaying ? "text-green-400" : "text-white")}
                    >
                      {isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                    </button>
                  )}
                </div>

                {/* Sağ: Genel Ayarlar */}
                <div className="flex gap-3 text-gray-400">
                  <button onClick={() => setLang(l => l === "en" ? "tr" : "en")} className="hover:text-white font-bold text-xs flex items-center gap-1">
                    <Globe size={14}/> {lang.toUpperCase()}
                  </button>
                  <button onClick={toggleFullscreen} className="hover:text-white"><Maximize size={18}/></button>
                  <button onClick={() => setShowInfo(true)} className="hover:text-white"><Info size={18}/></button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INFO MODAL (REHBER) --- */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowInfo(false)}
          >
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X/></button>
              
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500"/> {t.title}
              </h2>
              
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>{t.guide.p1}</p>
                <ul className="space-y-3">
                  {t.guide.features.map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full shrink-0"/>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 text-center text-xs text-gray-400">
                  💡 {t.guide.tip}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}