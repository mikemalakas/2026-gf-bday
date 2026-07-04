import { useEffect, useRef, useState } from "react";
import BentoGallery from "./pages/BentoGallery";
import music from "@/assets/audio/kabisado_cut.m4a";

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-start music on the visitor's first interaction anywhere on the page
  useEffect(() => {
    const startMusic = () => {
      const audio = audioRef.current;
      if (!audio || isPlaying) return;

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Playback blocked:", err));
    };

    // Listen once for the first click, scroll, keydown, or touch
    const events: (keyof WindowEventMap)[] = [
      "click",
      "scroll",
      "keydown",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(event, startMusic, { once: true }),
    );

    return () => {
      events.forEach((event) => window.removeEventListener(event, startMusic));
    };
  }, [isPlaying]);

  return (
    <>
      <main>
        <BentoGallery />
        {/* <audio ref={audioRef} loop preload="auto">
          <source src={music} type="audio/mp4" />
        </audio> */}
      </main>
    </>
  );
}
