import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import revealImage from "@/assets/flames.jpg";

gsap.registerPlugin(ScrollTrigger);

export default function SpinZoomReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Starts tiny, invisible, and un-rotated — grows and spins into place
      gsap.set(imageRef.current, {
        scale: 0.2,
        opacity: 0,
        rotation: 0,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=1300", // increased to make room for the extra "hold" scroll distance
            scrub: 1,
            pin: true, // section stays fixed in view while the animation (and hold) plays out
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // markers: true, // uncomment to debug trigger points
          },
        })
        .to(imageRef.current, {
          scale: 1,
          opacity: 1,
          rotation: 360, // one full spin while it zooms in — bump this up (e.g. 720) for more spins
          ease: "none", // "none" keeps it tied 1:1 to scroll since this is scrubbed, not eased playback
          duration: 2,
        })
        // Empty tween = nothing changes, but it still consumes scroll distance,
        // so the fully-formed image just sits still on screen while you keep scrolling
        .to(imageRef.current, {}, "+=1");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        ref={imageRef}
        src={revealImage}
        alt="Reveal"
        style={{
          width: 400,
          maxWidth: "80%",
        }}
      />
    </div>
  );
}
