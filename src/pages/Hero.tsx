import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".zoom-box", {
        scale: 4, // grows to 4x its size
        scrollTrigger: {
          trigger: ".zoom-section",
          start: "top top",
          end: "+=1000", // pin lasts 1000px of scroll — tweak this to control zoom speed
          scrub: true,
          pin: true,
          markers: true,
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <div className="h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-3xl font-bold">Scroll down</h1>
      </div>

      <div className="zoom-section h-screen overflow-hidden flex items-center justify-center bg-black">
        <div className="zoom-box w-40 h-40 bg-orange-400 rounded-lg flex items-center justify-center text-2xl">
          zoom
        </div>
      </div>

      <div className="h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-3xl font-bold">unpinned, normal scroll resumes</h1>
      </div>
    </div>
  );
}
