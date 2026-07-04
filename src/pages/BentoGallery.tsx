import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Flip } from "gsap/Flip";
import HorizontalGallery from "./HorizontalGallery";
import { soloImages } from "@/lib/images";
// import BirthdayGreeting from "@/components/pages/BirthdayGreeting";
import BdayHat from "./BdayHat";
import bdayHatImage from "@/assets/bdayHat.png";
import bea1 from "@/assets/bea1.png";
import flowerProps from "@/lib/flowersProps";
import SplitTextReveal from "@/components/Splittextreveal";
import HorizontalCharReveal from "@/components/Horizontalscrolltext";
import HeartImageAnimation from "./HeartImageAnimation";
import CatWalkAnimation from "./CatWalkAnimation";
import SpinZoomReveal from "./SpinZoomReveal";

gsap.registerPlugin(ScrollTrigger, Flip, ScrollSmoother);

// NOTE: ScrollSmoother does its own scroll normalization (including on touch
// devices), so ScrollTrigger.normalizeScroll(true) is intentionally removed —
// running both at once causes them to fight over the scroll position. If you
// still see mobile jank, tune `smoothTouch` below instead of re-adding it.

export default function BentoGallery() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  // ScrollSmoother must be created once, wrapping everything that scrolls.
  // It needs the #smooth-wrapper / #smooth-content pair below in the JSX.
  useLayoutEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2, // seconds to "catch up" to native scroll — raise for a heavier, floatier feel
      smoothTouch: 0.1, // light smoothing on touch devices; keep low so it still feels native
      effects: true, // enables data-speed / data-lag attributes if you want parallax later
      normalizeScroll: true, // replaces the old ScrollTrigger.normalizeScroll(true) call
    });

    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const galleryElement = galleryRef.current;
    if (!galleryElement) return;

    let flipCtx: gsap.Context | undefined;

    const createTween = () => {
      const galleryItems =
        galleryElement.querySelectorAll<HTMLElement>(".gallery__item");

      flipCtx?.revert();
      galleryElement.classList.remove("gallery--final");

      flipCtx = gsap.context(() => {
        // Temporarily add the final class to capture the final state
        galleryElement.classList.add("gallery--final");
        const flipState = Flip.getState(galleryItems);
        galleryElement.classList.remove("gallery--final");

        const flip = Flip.to(flipState, {
          simple: true,
          ease: "expoScale(1, 5)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryElement,
            start: "center center",
            end: "+=100%",
            scrub: true,
            pin: galleryElement.parentElement,
            // markers: true,
          },
        });

        tl.add(flip);

        return () => gsap.set(galleryItems, { clearProps: "all" });
      });

      // ScrollSmoother caches scroll height; a rebuilt pin changes document
      // height, so nudge it (and ScrollTrigger) to recalculate.
      smootherRef.current?.refresh();
      ScrollTrigger.refresh();
    };

    createTween();

    // Mobile browsers fire `resize` when the address bar shows/hides while
    // scrolling (viewport HEIGHT changes), not just on real resizes. Rebuilding
    // the Flip/ScrollTrigger pin mid-scroll on every one of those events is what
    // breaks scrolling on mobile. Only rebuild when the WIDTH actually changes.
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        createTween();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      flipCtx?.revert();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div
          ref={wrapRef}
          className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        >
          <div
            ref={galleryRef}
            id="gallery-8"
            className="gallery gallery--bento relative h-full w-full flex-none"
          >
            {soloImages.map((src, i) => (
              <div className="gallery__item relative flex-none" key={i}>
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        <section className="bg-[#0d0208]">
          <HorizontalCharReveal
            scrollDistance="+=4000px"
            className=" text-white"
          >
            Happy birthday Bubby!!!
          </HorizontalCharReveal>
          <BdayHat hatSrc={bdayHatImage} girlSrc={bea1} flowers={flowerProps} />
          <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
            <SplitTextReveal
              as="h1"
              className="font-poppins text-xl lg:text-6xl text-[#f7e9ec]/90"
              splitType="lines"
              animateOn="scroll"
              from={{ opacity: 0, yPercent: 100 }}
              stagger={0.1}
            >
              Hello bubby unang una sa lahat gusto kong malaman mo na mahal na
              mahal kita. Sana maging masaya ka sa araw na to at sana maraming
              blessing pa ang dumating pa sa buhay naten. Looking forward sa
              future naten and sa journey naten dalawa. Lagi mong tatandaan
              andito lang ako para saiyo and susuportahan kita sa kahit anong
              gusto mo. I love you so much bub.
            </SplitTextReveal>
          </div>

          <HeartImageAnimation />
          <SpinZoomReveal />

          <HorizontalGallery />
          <CatWalkAnimation />
        </section>

        {/* Bento grid-area layout — kept as scoped CSS since Tailwind doesn't
            cleanly express named/numeric grid-area placement per child. */}
        <style>{`
          .gallery--bento {
            display: grid;
            gap: 1vh;
            grid-template-columns: repeat(3, 32.5vw);
            grid-template-rows: repeat(4, 23vh);
            justify-content: center;
            align-content: center;
          }
          .gallery--final.gallery--bento {
            grid-template-columns: repeat(3, 100vw);
            grid-template-rows: repeat(4, 49.5vh);
            gap: 1vh;
          }
          .gallery--bento .gallery__item:nth-child(1) { grid-area: 1 / 1 / 3 / 2; }
          .gallery--bento .gallery__item:nth-child(2) { grid-area: 1 / 2 / 2 / 3; }
          .gallery--bento .gallery__item:nth-child(3) { grid-area: 2 / 2 / 4 / 3; }
          .gallery--bento .gallery__item:nth-child(4) { grid-area: 1 / 3 / 3 / 3; }
          .gallery--bento .gallery__item:nth-child(5) { grid-area: 3 / 1 / 3 / 2; }
          .gallery--bento .gallery__item:nth-child(6) { grid-area: 3 / 3 / 5 / 4; }
          .gallery--bento .gallery__item:nth-child(7) { grid-area: 4 / 1 / 5 / 2; }
          .gallery--bento .gallery__item:nth-child(8) { grid-area: 4 / 2 / 5 / 3; }
        `}</style>
      </div>
    </div>
  );
}
