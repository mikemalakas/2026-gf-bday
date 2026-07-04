import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { images } from "@/lib/images";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const track = trackRef.current!;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - document.documentElement.clientWidth),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () =>
          "+=" + (track.scrollWidth - document.documentElement.clientWidth),
        animation: tween,
        scrub: true,
        pin: section,
        invalidateOnRefresh: true,
      });
    }, section);

    // wait for every image to actually load before trusting scrollWidth
    const imgs = Array.from(track.querySelectorAll("img"));
    const loadPromises = imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    );

    Promise.all(loadPromises).then(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="h-screen overflow-hidden bg-[#0d0208]">
      <div ref={trackRef} className="flex h-full items-center gap-10 px-12">
        {images.map((src, i) => (
          <div
            key={i}
            className="shrink-0 overflow-hidden rounded w-75 lg:w-[30vw]"
          >
            <img
              src={src}
              className="h-full w-full object-cover aspect-square"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
