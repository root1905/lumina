"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, Minimize, Play, Pause, Info, 
  Palette, Grid3X3, Activity, Layers, Monitor, Type 
} from "lucide-react";
import { clsx } from "clsx";

// --- VERİ TİPLERİ VE SABİTLER ---

const COLORS = [
  { id: "white", value: "#FFFFFF", label: "Pure White" },
  { id: "black", value: "#000000", label: "Deep Black" },
  { id: "red", value: "#FF0000", label: "Red" },
  { id: "green", value: "#00FF00", label: "Green" },
  { id: "blue", value: "#0000FF", label: "Blue" },
];

const PATTERNS = [
  { id: "color", label: "Solid Colors", icon: Palette },
  { id: "grid", label: "Geometry Grid", icon: Grid3X3 },
  { id: "gradient", label: "Color Gradient", icon: Layers },
  { id: "text", label: "Readability", icon: Type },
];

// --- ANA UYGULAMA ---

export default function Page() {
  // State Yönetimi
  const [mode, setMode] = useState<"color" | "grid" | "gradient" | "text">("color");
  const [colorIndex, setColorIndex] = useState(0);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Aktif Renk
  const activeColor = customColor || COLORS[colorIndex].value;

  // --- WAKE LOCK & UI GİZLEME (Aynı kalıyor) ---
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) { console.log("Wake Lock error", err); }
    };
    
    const handleActivity = () => {
      setShowUI(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => !showInfo && setShowUI(false), 3000);
    };

    requestWakeLock();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [showInfo]);

  // --- RENK DÖNGÜSÜ (Sadece Color modunda) ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && mode === "color") {
      interval = setInterval(() => {
        setCustomColor(null);
        setColorIndex((prev) => (prev + 1) % COLORS.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  // --- FULLSCREEN ---
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
      className="relative w-full h-screen overflow-hidden cursor-none"
      style={{ 
        backgroundColor: mode === "color" ? activeColor : "#000",
        cursor: showUI ? "default" : "none" 
      }}
    >
      {/* --- DESEN RENDER ALANI --- */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        
        {/* MOD 1: GRID TESTİ */}
        {mode === "grid" && (
          <div className="w-full h-full relative bg-black">
             {/* Dikey Çizgiler */}
             <div className="absolute inset-0 flex justify-between">
                {[...Array(20)].map((_, i) => (
                  <div key={`v-${i}`} className="w-px h-full bg-white/30" />
                ))}
             </div>
             {/* Yatay Çizgiler */}
             <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(20)].map((_, i) => (
                  <div key={`h-${i}`} className="w-full h-px bg-white/30" />
                ))}
             </div>
             {/* Merkez Daireler */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/2 h-1/2 border border-white rounded-full opacity-50"></div>
                <div className="w-1/4 h-1/4 border border-red-500 rounded-full opacity-50"></div>
             </div>
          </div>
        )}

        {/* MOD 2: GRADIENT TESTİ */}
        {mode === "gradient" && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-gradient-to-r from-black via-gray-500 to-white"></div>
            <div className="flex-1 bg-gradient-to-r from-black via-red-500 to-white"></div>
            <div className="flex-1 bg-gradient-to-r from-black via-green-500 to-white"></div>
            <div className="flex-1 bg-gradient-to-r from-black via-blue-500 to-white"></div>
          </div>
        )}

        {/* MOD 3: TEXT READABILITY */}
        {mode === "text" && (
          <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center p-10 space-y-8 select-none">
            <h1 className="text-6xl font-black tracking-tighter">Sharpness Test</h1>
            <p className="text-xs">The quick brown fox jumps over the lazy dog (12px)</p>
            <p className="text-sm">The quick brown fox jumps over the lazy dog (14px)</p>
            <p className="text-base">The quick brown fox jumps over the lazy dog (16px)</p>
            <p className="text-xl">The quick brown fox jumps over the lazy dog (20px)</p>
            <div className="flex gap-4 mt-8">
               <div className="w-32 h-32 bg-black text-white flex items-center justify-center text-xs">Black BG</div>
               <div className="w-32 h-32 bg-gray-200 text-gray-500 flex items-center justify-center text-xs">Low Contrast</div>
            </div>
          </div>
        )}
      </div>

      {/* --- YENİ DOCK / KONTROL PANELİ --- */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex flex-col items-center gap-4">
              
              {/* Üst Bar: Mod Seçici */}
              <div className="flex bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-1 gap-1">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setMode(p.id as any);
                      setIsPlaying(false);
                    }}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      mode === p.id 
                        ? "bg-white text-black shadow-lg" 
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <p.icon size={16} />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Alt Bar: Renkler ve Kontroller (Sadece Color Modunda) */}
              {mode === "color" && (
                <div className="flex items-center gap-3 p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                  {/* Renk Topları */}
                  <div className="flex gap-2 pr-3 border-r border-white/10">
                    {COLORS.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsPlaying(false);
                          setCustomColor(null);
                          setColorIndex(i);
                        }}
                        className={clsx(
                          "w-6 h-6 rounded-full border border-white/20 transition-transform",
                          activeColor === c.value && !isPlaying && "scale-125 border-white ring-2 ring-white/20"
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    {/* Custom Color Input */}
                    <label className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 cursor-pointer border border-white/20 relative flex items-center justify-center">
                        <Palette size={12} className="text-white mix-blend-difference"/>
                        <input type="color" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={(e) => setCustomColor(e.target.value)} />
                    </label>
                  </div>

                  {/* Play/Pause */}
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 text-white hover:bg-white/10 rounded-lg">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                </div>
              )}

              {/* Ortak Kontroller (Fullscreen & Info) */}
              <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
                 <button onClick={toggleFullscreen} className="p-3 bg-black/80 backdrop-blur border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-colors">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                 </button>
                 <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-black/80 backdrop-blur border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-colors">
                    <Info size={18} />
                 </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Modal (Kısaltıldı) */}
      <AnimatePresence>
        {showInfo && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
              <div className="bg-[#111] p-6 rounded-2xl max-w-md text-gray-300 border border-white/10">
                 <h2 className="text-xl font-bold text-white mb-2">Lumina Pro Guide</h2>
                 <p className="mb-4">Select a mode from the top bar:</p>
                 <ul className="space-y-2 text-sm list-disc pl-4">
                    <li><strong className="text-white">Color:</strong> Dead pixel check.</li>
                    <li><strong className="text-white">Grid:</strong> Screen geometry & alignment.</li>
                    <li><strong className="text-white">Gradient:</strong> Color banding test.</li>
                    <li><strong className="text-white">Text:</strong> Sharpness & readability.</li>
                 </ul>
                 <p className="mt-4 text-xs text-gray-500">Tap anywhere to close.</p>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}