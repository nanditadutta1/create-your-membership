import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MembershipLanding from "@/components/MembershipLanding";
import { MembershipData, MembershipVariant } from "@/types/membership";

const VARIANT_THEMES: Record<number, { bg: string; font: string }> = {
  1: { bg: "rgb(42, 85, 136)", font: "#FFFFFF" },
  2: { bg: "rgb(247, 245, 228)", font: "#000000" },
  3: { bg: "rgb(0, 101, 88)", font: "#FFFFFF" },
  4: { bg: "#C2C1C1", font: "#000000" },
  5: { bg: "#daa41b", font: "#FFFFFF" },
};

function variantToProps(data: MembershipData, variant: MembershipVariant, index: number, logoUrl?: string) {
  const theme = VARIANT_THEMES[index + 1] || VARIANT_THEMES[1];
  return {
    brandInitials: data.brand_initials,
    restaurantName: data.brand_name,
    city: data.location,
    logoUrl,
    title: variant.name,
    subtitle: variant.marketing_message,
    price: variant.price,
    originalPrice: variant.original_value,
    savings: variant.savings,
    validity: variant.duration,
    benefits: variant.rewards.map((r, i) => ({
      id: i + 1,
      type: (r.type === "free_item" ? "freebie" : r.type === "discount" ? "discount" : "perk") as "discount" | "freebie" | "perk" | "points",
      title: r.title,
      desc: r.description,
      emoji: r.emoji,
      uses: r.uses,
    })),
    terms: [
      "Membership is non-refundable and non-transferable.",
      "Benefits are valid only at participating stores.",
      "The brand reserves the right to modify benefits with prior notice.",
    ],
    faqs: [
      { q: "Can I share my membership?", a: "No, the membership is linked to your phone number and cannot be shared or transferred." },
      { q: "What happens after it expires?", a: "You can renew your membership at the current price. Unused benefits will not carry over." },
      { q: "How do I redeem benefits?", a: "Show your membership page at the store. The staff will apply the benefit to your order." },
    ],
    themeColor: theme.bg,
    fontColor: theme.font,
    variantType: variant.type,
  };
}

export default function PreviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const membershipData = location.state?.membershipData as MembershipData | undefined;
  const logoUrl = (location.state?.logoUrl as string) || undefined;

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const variants = membershipData?.variants ?? [];
  const total = variants.length;

  const goNext = useCallback(() => setCurrentIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (!membershipData) {
    return (
      <div className="preview-root">
        <div className="gen-glow" />
        <div style={{ textAlign: "center", color: "#fff", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Gambarino', serif", fontSize: 28, marginBottom: 12 }}>No membership data</h2>
          <p style={{ marginBottom: 20, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}>Generate a membership plan first.</p>
          <button onClick={() => navigate("/generator")} className="preview-back-btn">
          ← Home
          </button>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const variant = variants[currentIndex];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="preview-root"
    >
      <div className="gen-glow" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "124px 24px 40px", position: "relative", zIndex: 1 }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="preview-back-btn"
          style={{ alignSelf: "flex-start", marginBottom: 16 }}
        >
          ← Home
        </button>

        {/* Navigation + Phone */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Left arrow */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="preview-nav-btn"
            style={{
              opacity: currentIndex === 0 ? 0.3 : 1,
              cursor: currentIndex === 0 ? "default" : "pointer",
            }}
          >
            ‹
          </button>

          {/* iPhone 15 Pro Frame — UNTOUCHED */}
          <div
            style={{
              position: "relative",
              width: 393,
              height: 852,
              borderRadius: 54,
              background: "hsl(0,0%,5%)",
              boxShadow: "0 0 0 2px hsl(0,0%,15%), 0 0 0 4px hsl(0,0%,8%), 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px hsl(0,0%,12%)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "absolute", left: -3, top: 180, width: 3, height: 32, background: "hsl(0,0%,12%)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 240, width: 3, height: 60, background: "hsl(0,0%,12%)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 310, width: 3, height: 60, background: "hsl(0,0%,12%)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", right: -3, top: 260, width: 3, height: 80, background: "hsl(0,0%,12%)", borderRadius: "0 2px 2px 0" }} />

            <div style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 50, overflow: "hidden", background: "hsl(220,10%,7%)" }}>
              <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 126, height: 36, borderRadius: 100, background: "#000", zIndex: 100 }} />
              <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                <MembershipLanding key={currentIndex} {...variantToProps(membershipData, variant, currentIndex, logoUrl)} />
              </div>
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={goNext}
            disabled={currentIndex === total - 1}
            className="preview-nav-btn"
            style={{
              opacity: currentIndex === total - 1 ? 0.3 : 1,
              cursor: currentIndex === total - 1 ? "default" : "pointer",
            }}
          >
            ›
          </button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {variants.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: currentIndex === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: currentIndex === i ? "#fff" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
          {currentIndex + 1} / {total}
        </div>
      </div>
    </div>
  );
}
