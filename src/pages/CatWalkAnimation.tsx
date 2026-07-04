import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import catImage from "@/assets/cat.png";
import bouquetImage from "@/assets/boquet.png";

gsap.registerPlugin(ScrollTrigger);

export default function CatWalkAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLImageElement>(null);
  const bouquetRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Start positions
      gsap.set(catRef.current, {
        xPercent: -50,
        x: window.innerWidth,
        y: 0,
        scaleX: -1,
      });

      gsap.set(bouquetRef.current, {
        xPercent: -50,
        opacity: 0,
        scale: 0.5,
        y: 20,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1500",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Walk to center
      tl.to(
        catRef.current,
        {
          x: 0,
          duration: 3,
          ease: "none",
        },
        0,
      );

      // Walking bounce
      for (let i = 0; i < 12; i++) {
        tl.to(
          catRef.current,
          {
            y: i % 2 === 0 ? -8 : 0,
            duration: 0.25,
            ease: "none",
          },
          i * 0.25,
        );
      }

      // Bouquet appears
      tl.to(
        bouquetRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        3,
      );

      // Happy hop
      tl.to(
        catRef.current,
        {
          y: -16,
          duration: 0.2,
          ease: "power2.out",
        },
        3,
      ).to(
        catRef.current,
        {
          y: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        3.2,
      );

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          height: "420px",
        }}
      >
        {/* Bouquet */}
        <img
          ref={bouquetRef}
          src={bouquetImage}
          alt="Bouquet"
          style={{
            position: "absolute",
            bottom: 50,
            left: "58%",
            width: 150,
            zIndex: 1,
          }}
        />

        {/* Cat */}
        <img
          ref={catRef}
          src={catImage}
          alt="Cat"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: 600,
            willChange: "transform",
          }}
        />
      </div>
    </section>
  );
}
