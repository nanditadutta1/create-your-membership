import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Carousel } from "3d-react-carousal";

// Import all showcase images
import s1 from "@/assets/showcase/silver-1.png";
import s2 from "@/assets/showcase/silver-2.png";
import s3 from "@/assets/showcase/silver-3.png";
import s4 from "@/assets/showcase/silver-4.png";
import s5 from "@/assets/showcase/silver-5.png";
import s6 from "@/assets/showcase/silver-6.png";
import s7 from "@/assets/showcase/silver-7.png";
import s8 from "@/assets/showcase/silver-8.png";
import s9 from "@/assets/showcase/silver-9.png";
import s10 from "@/assets/showcase/silver-10.png";

const SHOWCASE_IMAGES = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10];

const carouselSlides = SHOWCASE_IMAGES.map((src, i) => (
  <img
    key={i}
    src={src}
    alt={`Membership example ${i + 1}`}
    draggable={false}
    style={{
      height: "min(65vh, 600px)",
      width: "auto",
      objectFit: "contain",
    }}
  />
));

const CYCLING_TEXTS = [
  { prefix: "Turn your\nregulars into", highlight: "Paying members" },
  { prefix: "Build habits that\nkeep guests", highlight: "coming back" },
  { prefix: "Imagine customers", highlight: "visiting\n4x more often" },
  { prefix: "Your Restaurant's", highlight: "new Revenue\nStream" },
];

// Preload all images into browser cache
SHOWCASE_IMAGES.forEach((src) => {
  const img = new Image();
  img.src = src;
});

export default function WelcomePage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % CYCLING_TEXTS.length);
        setPhase("in");
      }, 600);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  const current = CYCLING_TEXTS[activeIndex];

  return (
    <div className="welcome-root">
      <div className="welcome-glow" />

      <div className="welcome-content">
        {/* Animated heading */}
        <h1
          className={`welcome-heading welcome-motion ${phase === "in" ? "motion-in" : "motion-out"}`}
          style={{ minHeight: "3.45em" }}
        >
          {current.prefix.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
          <span className="welcome-heading-highlight">
            {current.highlight.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        </h1>

        {/* CTA */}
        <button
          onClick={() => {
            document.querySelector('.welcome-root')?.classList.add('page-exit');
            setTimeout(() => navigate("/generator"), 400);
          }}
          className={`welcome-cta welcome-stagger-2 ${mounted ? "stagger-visible" : "stagger-hidden"}`}
        >
          Build your membership
          <span className="welcome-cta-arrow">→</span>
        </button>

        {/* Showcase 3D Carousel */}
        <div
          className={`welcome-stagger-3 carousel-3d-wrapper ${mounted ? "stagger-visible" : "stagger-hidden"}`}
          style={{
            width: "min(90vw, 900px)",
            height: "min(65vh, 620px)",
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Carousel slides={carouselSlides} autoplay={false} />
        </div>
      </div>
    </div>
  );
}
