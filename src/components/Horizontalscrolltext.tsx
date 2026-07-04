import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface HorizontalCharRevealProps {
  children: string;
  className?: string;
  /**
   * Total scroll distance the whole horizontal pass takes, e.g. "+=5000px"
   * or "+=300%". Longer = slower scroll-per-pixel-of-text, more room for
   * each character's own reveal window to breathe.
   */
  scrollDistance?: string;
  /** Random Y offset range (px) each character starts from */
  yRange?: [number, number];
  /** Random rotation range (deg) each character starts from */
  rotationRange?: [number, number];
  /** Gap between... actually this is one block of text, so gap is unused
   *  unless you pass multiple lines — kept simple: single heading string in. */
}

export default function HorizontalCharReveal({
  children,
  className,
  scrollDistance = "+=5000px",
  yRange = [-200, 200],
  rotationRange = [-20, 20],
}: HorizontalCharRevealProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLLabelElement | null>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const text = textRef.current;
    if (!wrapper || !text) return;

    let split: SplitText | undefined;
    let ctx: gsap.Context | undefined;

    // Wait for fonts before splitting — SplitText measures character
    // positions from the rendered font, and a late font swap after
    // splitting throws off every char's start position.
    const setup = () => {
      ctx = gsap.context(() => {
        split = new SplitText(text, { type: "chars, words" });

        // The outer scrub: the whole line travels leftward as the section
        // stays pinned. This is the "track" every character's own
        // ScrollTrigger below rides along via containerAnimation.
        const scrollTween = gsap.to(text, {
          xPercent: -100,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            pin: true,
            end: scrollDistance,
            scrub: true,
          },
        });

        // Each character gets its OWN ScrollTrigger, but instead of tracking
        // real page scroll, it tracks progress along `scrollTween` — so a
        // character animates in exactly when it scrolls into the pinned
        // viewport horizontally, not based on vertical page position.
        split.chars.forEach((char) => {
          gsap.from(char, {
            yPercent: gsap.utils.random(yRange[0], yRange[1]),
            rotation: gsap.utils.random(rotationRange[0], rotationRange[1]),
            opacity: 0,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: char,
              containerAnimation: scrollTween,
              start: "left 100%",
              end: "left 30%",
              scrub: 1,
            },
          });
        });
      }, wrapper);
    };

    if (document.fonts?.status === "loaded") {
      setup();
    } else {
      document.fonts?.ready.then(setup).catch(setup);
    }

    return () => {
      ctx?.revert(); // kills scrollTween + every per-char ScrollTrigger
      split?.revert(); // restores the original unsplit text node
    };
  }, [children, scrollDistance, yRange, rotationRange]);

  return (
    <section
      ref={wrapperRef}
      className={`relative flex h-screen items-center overflow-hidden ${className ?? ""}`}
    >
      <div className="container">
        <label
          ref={textRef}
          className="flex w-max whitespace-nowrap gap-[4vw] pl-[100vw] font-semibold leading-[1.1] text-[clamp(2rem,10vw,12rem)]"
        >
          {children}
        </label>
      </div>
    </section>
  );
}
