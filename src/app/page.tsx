"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, Minimize, Play, Pause, Info, 
  Palette, Grid3X3, Layers, Type, Zap, Globe, X,
  Volume2, Fingerprint, Activity 
} from "lucide-react";
import { clsx } from "clsx";

// --- TİP TANIMLAMALARI (Type Safety) ---
type ModeType = "color" | "grid" | "gradient" | "text" | "repair" | "audio" | "motion" | "touch";
type AudioNoteType = "left" | "right" | "center" | "bass" | "treble";
type LangType = "en" | "tr";

interface TranslationStructure {
  title: string;
  modes: Record<ModeType, string>;
  audio: Record<AudioNoteType, string>;
  guide: {
    title: string;
    features: string[];
    tip: string;
  };
}

const TRANSLATIONS: Record<LangType, TranslationStructure> = {
  en: {
    title: "Lumina Pro",
    modes: {
      color: "Color Cycle",
      grid: "Geometry",
      gradient: "Banding",
      text: "Sharpness",
      repair: "Repair (Noise)",
      audio: "Audio Lab",
      motion: "Motion / Hz",
      touch: "Touch Test"
    },
    audio: { left: "Left", right: "Right", center: "Center", bass: "Bass", treble: "Treble" },
    guide: {
      title: "System Status",
      features: [
        "Motion Test: Check for ghosting/blur on high refresh screens.",
        "Touch Test: Draw to find dead touch zones.",
        "Audio Lab: Test stereo balance & frequency.",
        "Repair: Fix stuck pixels with high-speed noise."
      ],
      tip: "Double tap anywhere to hide UI."
    }
  },
  tr: {
    title: "Lumina Pro",
    modes: {
      color: "Renk Döngüsü",
      grid: "Geometri",
      gradient: "Gradyan",
      text: "Keskinlik",
      repair: "Tamir (Gürültü)",
      audio: "Ses Laboratuvarı",
      motion: "Hareket / Hz",
      touch: "Dokunmatik"
    },
    audio: { left: "Sol", right: "Sağ", center: "Merkez", bass: "Bas", treble: "Tiz" },
    guide: {
      title: "Sistem Durumu",
      features: [
        "Hareket Testi: Yüksek Hz ekranlarda bulanıklık testi.",
        "Dokunmatik: Çizim yaparak ölü bölgeleri tespit edin.",
        "Ses Laboratuvarı: Stereo denge ve frekans testi.",
        "Tamir: Hızlı gürültü ile sıkışmış pikselleri düzeltin."
      ],
      tip: "Arayüzü gizlemek için ekrana çift tıklayın."
    }
  }
};

// --- SABİTLER ---
const COLORS = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
const MODES: { id: ModeType; icon: any }[] = [
  { id: "color", icon: Palette },
  { id: "motion", icon: Activity },
  { id: "touch", icon: Fingerprint },
  { id: "audio", icon: Volume2 },
  { id: "repair", icon: Zap },
  { id: "grid", icon: Grid3X3 },
  { id: "gradient", icon: Layers },
  { id: "text", icon: Type },
];

export default function Page() {
  // State
  const [lang, setLang] = useState<LangType>("en");
  const [mode, setMode] = useState<ModeType>("color");
  const [colorIndex, setColorIndex] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [fps, setFps] = useState(0);
  
  // Audio & Canvas Refs (HATA DÜZELTME: useRef null ile başlatılmalı)
  const [activeNote, setActiveNote] = useState<AudioNoteType | null>(null);
  const touchCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const requestRef = useRef<number | null>(null); // Hata kaynağı düzeltildi
  const previousTimeRef = useRef<number | null>(null); // Hata kaynağı düzeltildi

  const t = TRANSLATIONS[lang];

  // --- INIT & FPS COUNTER ---
  useEffect(() => {
    // Tarayıcı dili kontrolü
    if (typeof window !== "undefined") {
      setLang(navigator.language.startsWith("tr") ? "tr" : "en");
    }

    // Wake Lock (Ekran açık kalsın)
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log("Wake Lock not supported or ignored");
      }
    };
    requestWakeLock();

    // FPS Loop
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        if (deltaTime > 0) {
          setFps(Math.round(1000 / deltaTime));
        }
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- TOUCH TEST LOGIC ---
  useEffect(() => {
    if (mode === "touch" && touchCanvasRef.current) {
      const canvas = touchCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      const getPos = (e: TouchEvent | MouseEvent) => {
        if ('touches' in e) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
          return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
        }
      };

      const handleMove = (e: TouchEvent | MouseEvent) => {
        // e.preventDefault(); // Sayfa kaydırmayı engelle (passive listener sorunu için kaldırılabilir veya css touch-action kullanılır)
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      const start = (e: TouchEvent | MouseEvent) => {
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        canvas.addEventListener("touchmove", handleMove, { passive: false });
        canvas.addEventListener("mousemove", handleMove);
      };

      const end = () => {
        canvas.removeEventListener("touchmove", handleMove);
        canvas.removeEventListener("mousemove", handleMove);
        ctx.beginPath();
      };

      canvas.addEventListener("touchstart", start, { passive: false });
      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("touchend", end);
      canvas.addEventListener("mouseup", end);

      return () => {
        canvas.removeEventListener("touchstart", start);
        canvas.removeEventListener("mousedown", start);
        canvas.removeEventListener("touchend", end);
        canvas.removeEventListener("mouseup", end);
      };
    }
  }, [mode]);

  // --- AUDIO LOGIC ---
  const stopTone = () => {
    if (oscRef.current) { 
      try {
        oscRef.current.stop(); 
        oscRef.current.disconnect(); 
      } catch (e) { /* Ignore if already stopped */ }
      oscRef.current = null; 
    }
    setActiveNote(null);
  };

  const playTone = (freq: number, type: OscillatorType, pan: number) => {
    stopTone();
    // Audio Context'i kullanıcı etkileşimiyle başlat
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    
    // Tarayıcı kısıtlaması varsa context'i resume et
    if (ctx?.state === 'suspended') {
      ctx.resume();
    }

    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    panner.pan.setValueAtTime(pan, ctx.currentTime);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start();
    oscRef.current = osc;
  };

  const handleAudio = (note: AudioNoteType) => {
    if (activeNote === note) { stopTone(); return; }
    setActiveNote(note);
    
    switch(note) {
      case "left": playTone(440, "sine", -1); break;
      case "right": playTone(440, "sine", 1); break;
      case "center": playTone(440, "sine", 0); break;
      case "bass": playTone(100, "sine", 0); break;
      case "treble": playTone(10000, "sine", 0); break;
    }
  };

  // --- UI AUTO HIDE ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activateUI = () => { 
      setShowUI(true); 
      clearTimeout(timer); 
      if (!showInfo) {
        timer = setTimeout(() => setShowUI(false), 3000); 
      }
    };
    
    window.addEventListener("pointermove", activateUI);
    window.addEventListener("click", activateUI);
    // Çift tıklama ile UI gizle/göster
    window.addEventListener("dblclick", () => setShowUI(prev => !prev));

    return () => { 
      window.removeEventListener("pointermove", activateUI); 
      clearTimeout(timer); 
    };
  }, [showInfo]);

  // --- RENDER ---
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white select-none touch-none">
      
      {/* FPS COUNTER */}
      <div className="absolute top-4 left-4 z-40 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-green-400 border border-green-900/30 pointer-events-none">
        {fps} FPS
      </div>

      {/* VISUAL LAYER */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
        
        {/* MODE: COLOR */}
        {mode === "color" && (
           <div className="w-full h-full cursor-pointer" style={{ backgroundColor: COLORS[colorIndex] }} onClick={() => setColorIndex((p) => (p + 1) % COLORS.length)} />
        )}

        {/* MODE: MOTION */}
        {mode === "motion" && (
          <div className="w-full h-full relative flex flex-col justify-center gap-20 overflow-hidden bg-[#222]">
             {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 4/i, ease: "linear" }}
                  className="w-[200px] h-12 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center text-black font-bold"
                >
                  {fps} FPS / {i}x Speed
                </motion.div>
             ))}
             <p className="text-center text-gray-500 text-sm mt-10">Follow the bars. Check for ghosting.</p>
          </div>
        )}

        {/* MODE: TOUCH */}
        {mode === "touch" && (
          <div className="w-full h-full bg-black relative">
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-800 text-4xl font-bold pointer-events-none select-none opacity-50">DRAW HERE</p>
            <canvas ref={touchCanvasRef} className="absolute inset-0 z-10 touch-none" />
          </div>
        )}

        {/* MODE: REPAIR */}
        {mode === "repair" && <RepairCanvas />} 

        {/* MODE: AUDIO */}
        {mode === "audio" && (
           <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
              <Volume2 size={80} className={activeNote ? "text-green-500 animate-pulse" : "text-gray-700"}/>
              
              {/* Channels */}
              <div className="flex gap-3">
                  {(["left", "center", "right"] as AudioNoteType[]).map(k => (
                    <button key={k} onClick={() => handleAudio(k)} 
                      className={clsx("px-4 py-3 border rounded-xl font-bold uppercase transition-all", activeNote===k ? "bg-white text-black scale-105" : "border-white/20 hover:bg-white/10")}>
                      {t.audio[k]}
                    </button>
                  ))}
              </div>
              
              {/* Frequency */}
              <div className="flex gap-3 mt-2">
                  {(["bass", "treble"] as AudioNoteType[]).map(k => (
                    <button key={k} onClick={() => handleAudio(k)} 
                      className={clsx("px-6 py-2 border rounded-full font-bold uppercase text-xs transition-all", 
                        activeNote===k ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50" : "border-white/20 hover:bg-white/10")}>
                      {t.audio[k]}
                    </button>
                  ))}
              </div>
           </div>
        )}

        {/* STANDARD MODES */}
        {mode === "grid" && <div className="w-full h-full grid grid-cols-12 grid-rows-6 border border-white/20 pointer-events-none">{[...Array(72)].map((_,i)=><div key={i} className="border border-white/5"/>)}</div>}
        {mode === "gradient" && <div className="w-full h-full bg-gradient-to-r from-black via-gray-500 to-white pointer-events-none"/>}
        {mode === "text" && <div className="p-10 bg-white text-black w-full h-full flex items-center justify-center pointer-events-none"><h1 className="text-6xl font-black">SHARPNESS</h1></div>}
      </div>

      {/* DOCK / UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} 
            className="fixed bottom-6 w-full flex justify-center z-50 pointer-events-none">
            
            <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl max-w-[95%] overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => { setMode(m.id); stopTone(); }} 
                    className={clsx("p-3 rounded-xl transition-all min-w-[64px] flex flex-col items-center gap-1", mode === m.id ? "bg-white text-black shadow-lg" : "text-gray-400 hover:bg-white/10 hover:text-white")}>
                    <m.icon size={20} />
                    <span className="text-[9px] font-bold uppercase truncate max-w-[64px]">{t.modes[m.id].split(" ")[0]}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2 px-2">
                 <button onClick={() => setLang(l => l==="en"?"tr":"en")} className="text-[10px] font-bold hover:text-green-400 flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                    <Globe size={12}/> {lang.toUpperCase()}
                 </button>
                 <button onClick={() => setShowInfo(true)} className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full">
                    <Info size={16} />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INFO MODAL */}
      <AnimatePresence>
        {showInfo && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
             className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
              <div className="bg-[#111] border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Activity size={20} className="text-green-500"/> {t.guide.title}</h2>
                    <button onClick={() => setShowInfo(false)} className="bg-white/10 p-1 rounded-full hover:bg-white/20"><X size={18}/></button>
                 </div>
                 
                 <ul className="space-y-3 text-sm text-gray-400">
                    {t.guide.features.map((f,i) => (
                      <li key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full shrink-0"/>
                        {f}
                      </li>
                    ))}
                 </ul>
                 
                 <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-green-500 font-mono bg-green-900/20 px-2 py-1 rounded">FPS: {fps}</span>
                    <span className="text-[10px] text-gray-600">{t.guide.tip}</span>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Repair Canvas Component (Optimized)
function RepairCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let id: number;
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Alpha kapatılarak performans artırıldı
    if (!ctx) return;

    const draw = () => {
      // Çözünürlüğü düşürerek performansı artırıyoruz (Noise etkisi için yeterli)
      const w = canvas.width = window.innerWidth / 4; 
      const h = canvas.height = window.innerHeight / 4;
      
      const idata = ctx.createImageData(w, h);
      const buf = new Uint32Array(idata.data.buffer);
      
      for(let i=0; i<buf.length; i++) {
        // Hızlı bitwise operatörler ile siyah/beyaz piksel
        buf[i] = Math.random() < 0.5 ? 0xFF000000 : 0xFFFFFFFF;
      }
      
      ctx.putImageData(idata, 0, 0);
      id = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(id);
  }, []);

  return <canvas ref={ref} className="w-full h-full opacity-90 image-rendering-pixelated pointer-events-none"/>;
}