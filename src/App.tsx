import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import BentoGallery from "./pages/BentoGallery";
import music from "@/assets/audio/kabisado_cut.m4a";

gsap.registerPlugin(ScrollToPlugin);

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.log("Playback blocked:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <main>
        <BentoGallery />

        <audio ref={audioRef} loop preload="auto">
          <source src={music} type="audio/mp4" />
        </audio>

        <button
          onClick={toggleMusic}
          aria-label="Toggle background music"
          className="fixed bottom-5 right-5 w-12 h-12 rounded-full text-white text-xl shadow-lg hover:scale-105 transition-transform z-50"
        >
          {isPlaying ? "🔊" : "🔇"}
        </button>
      </main>
    </>
  );
}
