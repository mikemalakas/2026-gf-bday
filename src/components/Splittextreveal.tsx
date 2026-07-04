import { useLayoutEffect, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

type SplitType = "chars" | "words" | "lines" | "words, chars";

interface SplitTextProps {
  children: string;
  /** HTML tag to render the text in (h1, p, span, etc.) */
  as?: ElementType;
  className?: string;
  /** What SplitText breaks the string into */
  splitType?: SplitType;
  /** "mount" animates as soon as the component appears; "scroll" waits until
   *  it scrolls into view. */
  animateOn?: "mount" | "scroll";
  /** Delay (seconds) between each char/word animating in */
  stagger?: number;
  duration?: number;
  ease?: string;
  /** Starting state each piece animates FROM */
  from?: gsap.TweenVars;
  /** Only relevant when animateOn="scroll" — standard ScrollTrigger start string */
  scrollStart?: string;
  /** Re-run the animation every time it re-enters view, vs. only once.
   *  Set to false (the default) if you want it to reverse on scroll-up. */
  once?: boolean;
  /**
   * Standard ScrollTrigger toggleActions string: "onEnter onLeave onEnterBack onLeaveBack".
   * Default plays in and reverses back out when you scroll back up past the
   * trigger start. Ignored if `once` is true.
   */
  toggleActions?: string;
  /** Delay before the animation begins (mount mode only) */
  delay?: number;
}

const DEFAULT_FROM: gsap.TweenVars = {
  opacity: 0,
  yPercent: 120,
  rotate: 4,
};

export default function SplitTextReveal({
  children,
  as: Tag = "div",
  className,
  splitType = "chars",
  animateOn = "scroll",
  stagger = 0.03,
  duration = 0.7,
  ease = "power3.out",
  from = DEFAULT_FROM,
  scrollStart = "top 90%",
  once = false,
  toggleActions = "play none none reverse",
  delay = 0,
}: SplitTextProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let split: SplitText | undefined;
    let ctx: gsap.Context | undefined;

    // Fonts loading late can throw off SplitText's line measurements, so wait
    // for them before splitting — otherwise "lines" mode especially can
    // measure wrong and animate the wrong groupings.
    const setup = () => {
      ctx = gsap.context(() => {
        split = new SplitText(el, {
          type: splitType,
          // Masks each piece so upward/rotated reveals don't show overflow —
          // SplitText wraps each unit in an overflow-hidden span automatically.
          mask: splitType.includes("lines") ? "lines" : undefined,
        });

        const targets =
          splitType === "chars"
            ? split.chars
            : splitType === "words"
              ? split.words
              : splitType === "lines"
                ? split.lines
                : split.chars; // "words, chars" -> animate at char granularity

        const tween = gsap.from(targets, {
          ...from,
          duration,
          ease,
          stagger,
          delay,
          scrollTrigger:
            animateOn === "scroll"
              ? {
                  trigger: el,
                  start: scrollStart,
                  once,
                  toggleActions: once ? undefined : toggleActions,
                }
              : undefined,
        });

        return () => {
          tween.kill();
        };
      }, el);
    };

    if (document.fonts?.status === "loaded") {
      setup();
    } else {
      document.fonts?.ready.then(setup).catch(setup);
    }

    return () => {
      ctx?.revert(); // kills tweens + ScrollTriggers created inside
      split?.revert(); // restores the original, unsplit text node
    };
  }, [
    children,
    splitType,
    animateOn,
    stagger,
    duration,
    ease,
    from,
    scrollStart,
    once,
    toggleActions,
    delay,
  ]);

  return (
    <Tag ref={elRef} className={className}>
      {children}
    </Tag>
  );
}
