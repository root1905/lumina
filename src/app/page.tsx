"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, Minimize, Play, Pause, Info, 
  Palette, MonitorCheck, Sun, Moon, MonitorX
} from "lucide-react";
import { clsx } from "clsx";

// Profesyonel Renk Paleti (Kalibrasyon Standartları)
const COLORS = [
  { id: "white", value: "#FFFFFF", label: "Pure White" },
  { id: "black", value: "#000000", label: "Deep Black" },
  { id: "red", value: "#FF0000", label: "Red" },
  { id: "green", value: "#00FF00", label: "Green" },
  { id: "blue", value: "#0000FF", label: "Blue" },
  { id: "cyan", value: "#00FFFF", label: "Cyan" },
  { id: "magenta", value: "#FF00FF", label: "Magenta" },
  { id: "yellow", value: "#FFFF00", label: "Yellow" },
];

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Aktif rengi belirle
  const activeColor = customColor || COLORS[currentIndex].value;

  // --- WAKE LOCK API (Ekranın Kapanmasını Engeller) ---
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`${err} - Wake Lock not supported`);
      }
    };
    
    // Sayfa odaklandığında tekrar kilitle
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // --- UI OTOMATİK GİZLEME ---
  const resetUITimer = useCallback(() => {
    setShowUI(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Eğer bilgi ekranı açıksa UI gizlenmesin
      if (!showInfo) setShowUI(false);
    }, 3000);
  }, [showInfo]);

  useEffect(() => {
    window.addEventListener("mousemove", resetUITimer);
    window.addEventListener("click", resetUITimer);
    window.addEventListener("keydown", resetUITimer);
    return () => {
      window.removeEventListener("mousemove", resetUITimer);
      window.removeEventListener("click", resetUITimer);
      window.removeEventListener("keydown", resetUITimer);
    };
  }, [resetUITimer]);

  // --- RENK DÖNGÜSÜ (Pixel Test) ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCustomColor(null); // Custom rengi iptal et
        setCurrentIndex((prev) => (prev + 1) % COLORS.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- KLAVYE KISAYOLLARI ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCustomColor(null);
        setCurrentIndex((prev) => (prev + 1) % COLORS.length);
      }
      if (e.key === "ArrowLeft") {
        setCustomColor(null);
        setCurrentIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
      }
      if (e.key === " ") setIsPlaying((prev) => !prev);
      if (e.key === "f") toggleFullscreen();
      if (e.key === "Escape") setShowInfo(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- TAM EKRAN ---
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
    <main
      className="relative w-full h-screen transition-colors duration-500 ease-in-out cursor-none"
      style={{ backgroundColor: activeColor, cursor: showUI ? "default" : "none" }}
      onClick={() => {
        // Ekrana tıklayınca döngüyü durdur/başlat (UI dışındaysa)
        if (!showUI && !showInfo) setIsPlaying(!isPlaying);
      }}
    >
      {/* --- INFO MODAL (SEO & Kullanım Kılavuzu) --- */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowInfo(false);
            }}
          >
            <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl max-w-lg w-full text-gray-300 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MonitorCheck className="text-blue-500" /> Lumina Pro
                </h2>
                <button onClick={() => setShowInfo(false)} className="hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">Lumina Pro</strong>, ekran kalibrasyonu, ölü piksel tespiti ve ortam ışığı sağlamak için tasarlanmış profesyonel bir web aracıdır.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-400">
                  <li><strong className="text-gray-200">Ölü Piksel Testi:</strong> Play butonuna basarak renk döngüsünü başlatın ve ekranda yanmayan nokta arayın.</li>
                  <li><strong className="text-gray-200">Ekran Yanması (Burn-in) Giderme:</strong> Uzun süreli renk değişimi LCD/OLED panelinizi tazelemeye yardımcı olabilir.</li>
                  <li><strong className="text-gray-200">Ortam Işığı:</strong> Odanızı aydınlatmak veya fotoğraf çekimlerinde soft light (yumuşak ışık) kaynağı olarak kullanın.</li>
                </ul>
                <div className="pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                  <span>v1.0.0 Stable</span>
                  <span>Developed by Melike Med OS</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DOCK / KONTROL PANELİ --- */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-black/5">
              
              {/* Renk Paleti */}
              <div className="flex items-center gap-2 px-2 border-r border-white/10">
                {COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setCustomColor(null);
                      setCurrentIndex(COLORS.indexOf(color));
                    }}
                    className={clsx(
                      "w-8 h-8 rounded-full border border-white/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500",
                      activeColor === color.value && !isPlaying && "ring-2 ring-white scale-110"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                
                {/* Özel Renk Seçici */}
                <div className="relative group ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 border border-white/10 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110">
                    <Palette size={14} className="text-white mix-blend-difference" />
                  </div>
                  <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCustomColor(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Kontrol Butonları */}
              <div className="flex items-center gap-2 px-2">
                <DockButton 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  active={isPlaying}
                  label={isPlaying ? "Pause Loop" : "Start Test"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </DockButton>

                <DockButton 
                  onClick={toggleFullscreen} 
                  active={isFullscreen}
                  label="Fullscreen"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </DockButton>

                <DockButton 
                  onClick={() => setShowInfo(true)} 
                  label="Info & Guide"
                >
                  <Info size={20} />
                </DockButton>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Dock İçin Özel Buton Bileşeni
function DockButton({ 
  children, onClick, active, label 
}: { 
  children: React.ReactNode, onClick: () => void, active?: boolean, label: string 
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={clsx(
          "p-3 rounded-xl transition-all duration-200",
          active 
            ? "bg-white text-black shadow-lg shadow-white/10" 
            : "text-gray-400 hover:text-white hover:bg-white/10"
        )}
      >
        {children}
      </button>
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800">
        {label}
      </span>
    </div>
  );
}