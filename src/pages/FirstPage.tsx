import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const flowerImages = [
  "/images/flower1.png",
  "/images/flower2.png",
  "/images/flower3.png",
];

interface Flower {
  id: number;
  top: number;
  left: number;
  size: number;
  src: string;
  duration: number;
}

const FLOWER_COUNT = 1;

export default function SpinningFlowers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const idCounter = useRef(0);

  const handleClick = () => {
    const newFlowers: Flower[] = Array.from({ length: FLOWER_COUNT }, () => ({
      id: idCounter.current++,
      top: Math.random() * 92, // 0–92vh, keeps flower fully on screen
      left: Math.random() * 92, // 0–92vw
      size: 40 + Math.random() * 60, // 40–100px, varied sizes look more natural
      src: flowerImages[Math.floor(Math.random() * flowerImages.length)],
      duration: 2 + Math.random() * 3, // 2–5s spin speed, varied so they don't sync
    }));

    setFlowers((prev) => [...prev, ...newFlowers]);
  };

  useGSAP(
    () => {
      const newEls = gsap.utils.toArray<HTMLElement>(
        ".flower:not([data-animated])",
      );

      newEls.forEach((el) => {
        el.setAttribute("data-animated", "true");

        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(2)",
            delay: Math.random() * 0.6, // stagger the pop-in so it doesn't look like one flat flash
          },
        );

        gsap.to(el, {
          rotation: 360,
          duration: parseFloat(el.dataset.spinDuration || "3"),
          repeat: -1,
          ease: "none",
        });
      });
    },
    { dependencies: [flowers], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gray-50"
    >
      <button
        onClick={handleClick}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
      >
        bloom
      </button>

      {flowers.map((flower) => (
        <img
          key={flower.id}
          src={flower.src}
          data-spin-duration={flower.duration}
          className="flower absolute"
          style={{
            top: `${flower.top}vh`,
            left: `${flower.left}vw`,
            width: `${flower.size}px`,
            height: `${flower.size}px`,
          }}
        />
      ))}
    </div>
  );
}
