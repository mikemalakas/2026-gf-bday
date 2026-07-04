import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

interface Flower {
  src: string;
  /** Horizontal position as % of the girl's own container width (not the
   *  full screen) — 0 is her left edge, 100 is her right edge. */
  xPercent: number;
  /** Vertical position as % from the bottom of the girl's container.
   *  Small negative values (default -2) let flowers peek just below her feet. */
  bottomPercent?: number;
  /** How far this flower rises (px) once it starts moving */
  riseDistance?: number;
  width?: string;
  rotation?: number;
}

interface BirthdayHatRevealProps {
  /** Path to the girl illustration (PNG, transparent bg recommended) */
  girlSrc: string;
  /** Path to the hat illustration (PNG, transparent bg recommended) */
  hatSrc: string;
  /**
   * Where the hat should land, as a % of the container's width/height.
   * Tune these to match the top of the girl's head in your image.
   */
  landingPosition?: { xPercent: number; yPercent: number };
  /** Final rotation (deg) of the hat once it's "worn" */
  landingRotation?: number;
  /** Final scale of the hat once it's "worn" */
  landingScale?: number;
  /** Flowers that rise up — only once the hat has landed */
  flowers?: Flower[];
  /**
   * Delay (in timeline "seconds") between each flower starting to rise,
   * so they don't all move in perfect unison. 0 = all rise together.
   */
  flowerStagger?: number;
}

export default function BirthdayHatReveal({
  girlSrc,
  hatSrc,
  landingPosition = { xPercent: 55, yPercent: 20 },
  landingRotation = -8,
  landingScale = 1,
  flowers = [],
  flowerStagger = 0.15,
}: BirthdayHatRevealProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hatRef = useRef<HTMLImageElement | null>(null);
  const flowerRefs = useRef<(HTMLImageElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const hat = hatRef.current;
    if (!section || !stage || !hat) return;

    const ctx = gsap.context(() => {
      const path = [
        { x: -260, y: -320, rotation: -120, scale: 0.6 },
        { x: -60, y: -160, rotation: -55, scale: 0.85 },
        { x: 20, y: -40, rotation: -15, scale: 1.05 },
        { x: 0, y: 0, rotation: landingRotation, scale: landingScale },
      ];

      gsap.set(hat, {
        xPercent: -50,
        yPercent: -50,
        left: `${landingPosition.xPercent}%`,
        top: `${landingPosition.yPercent}%`,
        x: path[0].x,
        y: path[0].y,
        rotation: path[0].rotation,
        scale: path[0].scale,
        opacity: 1,
      });

      const flowerEls = flowerRefs.current.filter(
        Boolean,
      ) as HTMLImageElement[];
      if (flowerEls.length) {
        // Hidden and un-risen until the timeline reaches "landed".
        gsap.set(flowerEls, { y: 0, opacity: 0 });
      }

      // One shared timeline: extra scroll distance is appended after the hat's
      // swoop (roughly a 55/45 split) so there's room for the flowers to rise
      // once the hat settles. Tune "+=220%" and the split if it feels rushed.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=220%",
          scrub: 0.6,
          pin: stage,
          // markers: true,
        },
      });

      // --- Phase 1: hat swoops in and lands ---
      tl.to(
        hat,
        {
          motionPath: { path, curviness: 1.5 },
          ease: "power1.inOut",
          duration: 1,
        },
        0,
      )
        .to(
          hat,
          {
            keyframes: {
              "0%": { rotation: path[0].rotation, scale: path[0].scale },
              "33%": { rotation: path[1].rotation, scale: path[1].scale },
              "66%": { rotation: path[2].rotation, scale: path[2].scale },
              "100%": { rotation: landingRotation, scale: landingScale },
            },
            ease: "power1.inOut",
            duration: 1,
          },
          0,
        )
        .addLabel("landed"); // <- the exact timeline moment the hat settles

      // --- Phase 2: flowers rise, gated to start at "landed" ---
      flowerEls.forEach((el, i) => {
        const rise = flowers[i]?.riseDistance ?? 200 + i * 60;
        tl.to(
          el,
          {
            y: -rise,
            opacity: 1,
            ease: "power1.out",
            duration: 1,
          },
          `landed+=${i * flowerStagger}`, // each flower starts slightly after the last
        );
      });
    }, section);

    return () => ctx.revert();
  }, [
    landingPosition.xPercent,
    landingPosition.yPercent,
    landingRotation,
    landingScale,
    flowers,
    flowerStagger,
  ]);

  return (
    <div ref={sectionRef} className="relative w-full">
      <div
        ref={stageRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <div className="relative h-[80vh] max-h-[700px] w-auto aspect-[3/4]">
          <img
            src={girlSrc}
            alt="Girl"
            className="relative z-10 h-full w-full object-contain"
            draggable={false}
          />
          <img
            ref={hatRef}
            src={hatSrc}
            alt="Birthday hat"
            className="absolute z-20 w-[35%] object-contain"
            draggable={false}
          />

          {/* Flowers live inside the girl's own container (not the full-width
              stage), so xPercent is relative to HER width and they cluster
              near her instead of drifting toward screen-center on wide viewports. */}
          {flowers.map((flower, i) => (
            <img
              key={i}
              ref={(el) => {
                flowerRefs.current[i] = el;
              }}
              src={flower.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute z-0"
              style={{
                left: `${flower.xPercent}%`,
                bottom:
                  flower.bottomPercent != null
                    ? `${flower.bottomPercent}%`
                    : "-2%",
                width: flower.width ?? "80px",
                transform: `rotate(${flower.rotation ?? 0}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
