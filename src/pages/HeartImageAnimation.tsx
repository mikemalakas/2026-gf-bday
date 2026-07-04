import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heartPhoto from "@/assets/couple/couple9.png";

gsap.registerPlugin(ScrollTrigger);

export default function HeartImageAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<SVGGElement>(null);
  const rightRef = useRef<SVGGElement>(null);
  const borderRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Start the two halves pulled apart and slightly rotated outward
      gsap.set(leftRef.current, {
        x: -90,
        rotation: -12,
        transformOrigin: "100px 180px",
      });
      gsap.set(rightRef.current, {
        x: 90,
        rotation: 12,
        transformOrigin: "100px 180px",
      });
      gsap.set(borderRef.current, { opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
            end: "top 15%",
            scrub: 1,
            // markers: true, // uncomment to debug trigger points
          },
        })
        .to(leftRef.current, { x: 0, rotation: 0, ease: "power2.out" }, 0)
        .to(rightRef.current, { x: 0, rotation: 0, ease: "power2.out" }, 0)
        // border fades in only once the halves are nearly reunited
        .to(borderRef.current, { opacity: 1, ease: "power1.in" }, 0.65);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="350"
        height="290"
        viewBox="0 0 200 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left half of the heart: bottom tip, up the left lobe, to the center notch */}
          <clipPath id="heart-left-clip">
            <path d="M100,180 C60,140 0,100 0,60 C0,20 40,0 70,20 C85,30 95,45 100,55 L100,180 Z" />
          </clipPath>

          {/* Right half of the heart: mirror of the left across x=100 */}
          <clipPath id="heart-right-clip">
            <path d="M100,180 C140,140 200,100 200,60 C200,20 160,0 130,20 C115,30 105,45 100,55 L100,180 Z" />
          </clipPath>
        </defs>

        {/* Left half: image + its own clip, moved together as one rigid piece */}
        <g ref={leftRef} clipPath="url(#heart-left-clip)">
          <image
            href={heartPhoto}
            x="0"
            y="0"
            width="200"
            height="180"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>

        {/* Right half: same image, other clip, moves in from the opposite side */}
        <g ref={rightRef} clipPath="url(#heart-right-clip)">
          <image
            href={heartPhoto}
            x="0"
            y="0"
            width="200"
            height="180"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>

        {/* Static full-heart outline, no center seam — sits above both halves,
            only fades in once they've reunited to frame the completed heart */}
        <path
          ref={borderRef}
          d="M100,180 C60,140 0,100 0,60 C0,20 40,0 70,20 C85,30 95,45 100,55 C105,45 115,30 130,20 C160,0 200,20 200,60 C200,100 140,140 100,180 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
