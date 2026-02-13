"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, Minimize, Play, Pause, Info, 
  Palette, Grid3X3, Layers, Type, Zap, Globe, X,
  Volume2, Speaker, Music
} from "lucide-react";
import { clsx } from "clsx";

// --- DİL PAKETİ ---
const TRANSLATIONS = {
  en: {
    title: "Lumina Pro",
    modes: {
      color: "Dead Pixel",
      grid: "Geometry",
      gradient: "Banding",
      text: "Sharpness",
      repair: "Burn-in Fix",
      audio: "Audio Test"
    },
    audio: {
      left: "Left CH",
      right: "Right CH",
      center: "Center",
      bass: "Bass (100Hz)",
      treble: "Treble (10kHz)"
    },
    guide: {
      title: "User Guide",
      features: [
        "Audio Lab: Test stereo separation (L/R) and frequency response.",
        "Dead Pixel: Cycle colors to find stuck pixels.",
        "Burn-in Fix: Flashing noise to repair stuck LCD crystals.",
        "Geometry & Text: Check alignment and readability."
      ],
      tip: "Double tap to toggle UI. Use headphones for best audio test."
    }
  },
  tr: {
    title: "Lumina Pro",
    modes: {
      color: "Ölü Piksel",
      grid: "Geometri",
      gradient: "Gradyan",
      text: "Keskinlik",
      repair: "Tamir Modu",
      audio: "Ses Testi"
    },
    audio: {
      left: "Sol Kanal",
      right: "Sağ Kanal",
      center: "Merkez",
      bass: "Bas (100Hz)",
      treble: "Tiz (10kHz)"
    },
    guide: {
      title: "Kullanım Kılavuzu",
      features: [
        "Ses Laboratuvarı: Stereo (Sağ/Sol) ayrımını ve frekans tepkisini test edin.",
        "Ölü Piksel: Sıkışmış pikselleri bulmak için renkleri gezin.",
        "Tamir Modu: Ekran yanıklarını gidermek için karıncalanma efekti.",
        "Geometri & Metin: Hizalama ve okunabilirlik testi."
      ],
      tip: "Arayüzü gizlemek için çift tıklayın. Ses testi için kulaklık önerilir."
    }
  }
};

// --- SABİTLER ---
const COLORS = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
const MODES = [
  { id: "color", icon: Palette },
  { id: "audio", icon: Volume2 }, // YENİ MOD
  { id: "repair", icon: Zap },
  { id: "grid", icon: Grid3X3 },
  { id: "gradient", icon: Layers },
  { id: "text", icon: Type },
];

export default function Page() {
  const [lang, setLang] = useState<"en" | "tr">("en");
  const [mode, setMode] = useState<string>("color");
  const [colorIndex, setColorIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  // Audio State
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // --- WAKE LOCK & INIT ---
  useEffect(() => {
    const browserLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(browserLang);
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {});
  }, []);

  // --- AUDIO ENGINE (SES MOTORU) ---
  const playTone = (freq: number, type: OscillatorType, pan: number) => {
    stopTone(); // Önceki sesi durdur
    
    // Audio Context Başlat (Tarayıcı izni için)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    // Osilatör (Ses Kaynağı)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Ayarlar
    gain.gain.setValueAtTime(0.5, ctx.currentTime); // Ses seviyesi %50
    panner.pan.setValueAtTime(pan, ctx.currentTime); // -1: Sol, 0: Orta, 1: Sağ

    // Bağlantı: Osc -> Gain -> Panner -> Çıkış
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start();
    oscRef.current = osc;
  };

  const stopTone = () => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    setActiveNote(null);
  };

  const handleAudioTest = (type: string) => {
    if (activeNote === type) {
      stopTone();
      return;
    }
    setActiveNote(type);
    
    switch (type) {
      case "left": playTone(440, "sine", -1); break;   // Sol Kanal (A4)
      case "right": playTone(440, "sine", 1); break;   // Sağ Kanal (A4)
      case "center": playTone(440, "sine", 0); break;  // Merkez
      case "bass": playTone(100, "sine", 0); break;    // Bass Test
      case "treble": playTone(10000, "sine", 0); break;// Tiz Test
    }
  };

  // --- NOISE EFFECT ---
  useEffect(() => {
    let animId: number;
    if (mode === "repair" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const draw = () => {
        if (!ctx) return;
        const w = canvasRef.current!.width = window.innerWidth / 4;
        const h = canvasRef.current!.height = window.innerHeight / 4;
        const idata = ctx.createImageData(w, h);
        const buf = new Uint32Array(idata.data.buffer);
        for (let i = 0; i < buf.length; i++) buf[i] = Math.random() < 0.5 ? 0xFF000000 : 0xFFFFFFFF;
        ctx.putImageData(idata, 0, 0);
        animId = requestAnimationFrame(draw);
      };
      draw();
    }
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  // --- UI TOGGLE ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activity = () => {
      setShowUI(true);
      clearTimeout(timer);
      timer = setTimeout(() => !showInfo && setShowUI(false), 3000);
    };
    window.addEventListener("mousemove", activity);
    window.addEventListener("click", activity);
    return () => { window.removeEventListener("mousemove", activity); clearTimeout(timer); };
  }, [showInfo]);

  // Fullscreen helper
  const toggleFS = () => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      
      {/* GÖRSEL ALAN */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: mode === "color" ? COLORS[colorIndex] : "#111" }}>
        
        {mode === "color" && (
           <button 
             onClick={() => setColorIndex((p) => (p + 1) % COLORS.length)} 
             className="absolute inset-0 w-full h-full cursor-pointer"
           />
        )}

        {mode === "repair" && <canvas ref={canvasRef} className="w-full h-full opacity-90 image-rendering-pixelated" />}
        
        {mode === "audio" && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
             <Volume2 size={80} className={clsx("transition-all duration-300", activeNote ? "text-green-500 scale-110" : "text-gray-600")} />
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">{activeNote ? (t.audio as any)[activeNote] : t.modes.audio}</h2>
                <p className="text-gray-500 text-sm">Testing Tone Generator</p>
             </div>
             {/* Frekans Görselleştirmesi (Fake Visualizer) */}
             <div className="flex gap-1 h-12 items-end">
                {[...Array(10)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: activeNote ? [10, 40, 10] : 4 }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className={clsx("w-2 rounded-full", activeNote ? "bg-green-500" : "bg-gray-800")}
                  />
                ))}
             </div>
          </div>
        )}

        {mode === "grid" && ( /* Grid Code same as before */
          <div className="w-full h-full grid grid-cols-12 grid-rows-6 border border-white/20">
             {[...Array(72)].map((_, i) => <div key={i} className="border border-white/10"/>)}
             <div className="absolute inset-0 flex items-center justify-center border-2 border-red-500 rounded-full w-[80vmin] h-[80vmin] opacity-50"/>
          </div>
        )}
      </div>

      {/* DOCK KONTROL PANELİ */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-3 shadow-2xl min-w-[320px]">
              
              {/* MOD SEÇİCİ */}
              <div className="flex justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => { setMode(m.id); stopTone(); }} 
                    className={clsx("flex flex-col items-center p-2 rounded-lg transition-all min-w-[50px]", mode === m.id ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                    <m.icon size={20} />
                    <span className="text-[9px] font-bold mt-1 uppercase">{(t.modes as any)[m.id].split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* ALT KONTROLLER */}
              <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-3">
                
                {/* AUDIO CONTROLS */}
                {mode === "audio" && (
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleAudioTest("left")} className={clsx("p-2 rounded text-xs font-bold border", activeNote === "left" ? "bg-green-500 border-green-500 text-black" : "border-white/20 hover:bg-white/10")}>L</button>
                    <button onClick={() => handleAudioTest("center")} className={clsx("p-2 rounded text-xs font-bold border", activeNote === "center" ? "bg-white text-black" : "border-white/20 hover:bg-white/10")}>CENTER</button>
                    <button onClick={() => handleAudioTest("right")} className={clsx("p-2 rounded text-xs font-bold border", activeNote === "right" ? "bg-green-500 border-green-500 text-black" : "border-white/20 hover:bg-white/10")}>R</button>
                    <button onClick={() => handleAudioTest("bass")} className={clsx("col-span-1.5 p-2 rounded text-xs font-bold border", activeNote === "bass" ? "bg-blue-500 border-blue-500 text-black" : "border-white/20 hover:bg-white/10")}>BASS</button>
                    <button onClick={() => handleAudioTest("treble")} className={clsx("col-span-1.5 p-2 rounded text-xs font-bold border", activeNote === "treble" ? "bg-yellow-500 border-yellow-500 text-black" : "border-white/20 hover:bg-white/10")}>TREBLE</button>
                  </div>
                )}

                {/* COLOR CONTROLS */}
                {mode === "color" && (
                  <div className="flex justify-center gap-3">
                    {COLORS.map((c, i) => (
                      <button key={c} onClick={() => setColorIndex(i)} className={clsx("w-6 h-6 rounded-full border-2", colorIndex === i ? "border-white scale-125" : "border-transparent opacity-50")} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}

                {/* COMMON TOOLS */}
                <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-1">
                   <button onClick={() => setLang(l => l === "en" ? "tr" : "en")} className="text-xs font-bold flex gap-1 items-center hover:text-green-400"><Globe size={12}/> {lang.toUpperCase()}</button>
                   <div className="flex gap-3">
                      <button onClick={toggleFS}><Maximize size={16} className="hover:text-white text-gray-400"/></button>
                      <button onClick={() => setShowInfo(true)}><Info size={16} className="hover:text-white text-gray-400"/></button>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* INFO MODAL */}
      <AnimatePresence>
        {showInfo && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
              <div className="bg-[#111] border border-white/10 p-6 rounded-3xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold flex gap-2 items-center"><Volume2 className="text-green-500"/> {t.title}</h2>
                    <button onClick={() => setShowInfo(false)}><X/></button>
                 </div>
                 <ul className="space-y-3 text-sm text-gray-300">
                    {t.guide.features.map((f, i) => <li key={i} className="flex gap-2"><div className="w-1 h-1 bg-green-500 rounded-full mt-2 shrink-0"/>{f}</li>)}
                 </ul>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}