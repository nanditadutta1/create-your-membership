import { useState, useEffect, useRef, useCallback } from "react";
import { X, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MembershipData } from "@/types/membership";
import loadingCard1 from "@/assets/loading-card-1.png";
import loadingCard2 from "@/assets/loading-card-2.png";
import loadingCard3 from "@/assets/loading-card-3.png";
import loadingChart1 from "@/assets/loading-chart-1.png";
import loadingChart2 from "@/assets/loading-chart-2.png";
import loadingChart4 from "@/assets/loading-chart-4.png";

interface SuggestResult {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  total_ratings: number | null;
}

const API_BASE = "https://swiggy-scraper-api.onrender.com";

const LOADING_SLIDES = [
  {
    key: "earned",
    type: "card" as const,
    title: (<>Beer Cafe has generated<br /><span className="loading-highlight">₹ 70 lakhs in revenue</span> <br />through Memberships</>),
    img: loadingCard1,
    imgClass: "loading-card-img",
  },
  {
    key: "return",
    type: "chart" as const,
    title: (<>Customers are returning <br /><span className="loading-highlight">upto 10X faster</span> after<br />buying a membership!</>),
    img: loadingChart1,
    imgClass: "loading-chart-img",
  },
  {
    key: "coffee-pass",
    type: "card" as const,
    title: (<><span className="loading-highlight">800+ Customers</span> have already <br />purchased the Monthly Coffee <br />Pass at Noa by Nutcracker</>),
    img: loadingCard2,
    imgClass: "loading-card-img",
  },
  {
    key: "spend-more",
    type: "chart" as const,
    title: (<>Members consistently <br /><span className="loading-highlight">spend 22-35% more</span><br />than non-members</>),
    img: loadingChart2,
    imgClass: "loading-chart-img",
  },
  {
    key: "vip-perks",
    type: "card" as const,
    title: (<>Restaurants of all types are <br />now launching exclusive<br /><span className="loading-highlight">VIP perks</span> for their regulars</>),
    img: loadingCard3,
    imgClass: "loading-card-img",
  },
];

export default function GeneratorPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<SuggestResult | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePhase, setSlidePhase] = useState<"in" | "out">("in");
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDataRef = useRef<{ membershipData: MembershipData; logoUrl: string | null } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Preload and cache all loading images eagerly
  useEffect(() => {
    [loadingCard1, loadingCard2, loadingCard3, loadingChart1, loadingChart2].forEach((src) => {
      const img = new Image();
      img.src = src;
      img.decoding = "async";
      if (!document.querySelector(`link[href="${src}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Loading slide carousel with cross-fade transitions
  useEffect(() => {
    if (!loading) return;
    setSlideIndex(0);
    setSlidePhase("in");

    const scheduleNext = () => {
      slideTimerRef.current = setTimeout(() => {
        setSlidePhase("out");
        setTimeout(() => {
          setSlideIndex((prev) => {
            const next = prev + 1;
            if (previewDataRef.current && next >= LOADING_SLIDES.length) {
              navigate("/previews", { state: previewDataRef.current });
              return prev;
            }
            return next % LOADING_SLIDES.length;
          });
          setSlidePhase("in");
          scheduleNext();
        }, 700);
      }, 9300);
    };

    scheduleNext();

    return () => { if (slideTimerRef.current) clearTimeout(slideTimerRef.current); };
  }, [loading, navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedRestaurant(null);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await supabase.functions.invoke("places-suggest", {
          body: { textQuery: value.trim() },
        });
        const data = res.data;
        const results = (data?.places || []).map((place: any) => ({
          place_id: place.id,
          name: place.displayName?.text || "",
          address: place.formattedAddress || "",
          lat: place.location?.latitude,
          lng: place.location?.longitude,
        }));
        if (results.length) { setSuggestions(results); setShowDropdown(true); }
        else { setSuggestions([]); setShowDropdown(false); }
      } catch (err) {
        console.error("Suggest error:", err);
        setSuggestions([]); setShowDropdown(false);
      }
      finally { setSuggestLoading(false); }
    }, 300);
  }, []);

  const handleSelectSuggestion = (item: SuggestResult) => {
    setSelectedRestaurant(item);
    setSearchQuery(item.name);
    setShowDropdown(false);
    setSuggestions([]);
    setError("");
  };

  const handleGenerate = async () => {
    if (!selectedRestaurant) { setError("Please search and select a restaurant first."); return; }
    setLoading(true); setError(""); previewDataRef.current = null;
    const totalStart = performance.now();
    try {
      console.log("[CLIENT TIMING] Starting scrape...");
      const scrapeStart = performance.now();
      const scrapeRes = await fetch(`${API_BASE}/api/scrape-gmaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: selectedRestaurant.place_id,
          name: selectedRestaurant.name,
          address: selectedRestaurant.address,
          lat: String(selectedRestaurant.lat),
          lng: String(selectedRestaurant.lng),
        }),
      });
      const scrapeData = await scrapeRes.json();
      console.log(`[CLIENT TIMING] Scrape done: ${((performance.now() - scrapeStart) / 1000).toFixed(1)}s`);
      if (!scrapeRes.ok || !scrapeData.success) {
        const detail = scrapeData?.detail || scrapeData?.error || "";
        if (detail.includes("Playwright") || detail.includes("browser") || detail.includes("Browser"))
          throw new Error("The scraping server is restarting. Please wait 1-2 minutes and try again.");
        throw new Error(detail.slice(0, 200) || `Failed to fetch restaurant data (status ${scrapeRes.status}). Please try again.`);
      }

      console.log("[CLIENT TIMING] Starting AI generation...");
      const aiStart = performance.now();
      const { data, error: fnError } = await supabase.functions.invoke("generate-membership", { body: { scraped_data: scrapeData } });
      console.log(`[CLIENT TIMING] AI generation done: ${((performance.now() - aiStart) / 1000).toFixed(1)}s`);
      console.log(`[CLIENT TIMING] Total time: ${((performance.now() - totalStart) / 1000).toFixed(1)}s`);
      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "Unknown error");

      previewDataRef.current = { membershipData: data.data as MembershipData, logoUrl: null };
    } catch (e: any) {
      setLoading(false);
      console.log(`[CLIENT TIMING] Failed after: ${((performance.now() - totalStart) / 1000).toFixed(1)}s`);
      const msg = e.message?.toLowerCase() || "";
      if (msg.includes("failed to send") || msg.includes("load failed") || msg.includes("failed to fetch") || msg.includes("networkerror"))
        setError("The request timed out. Please try again.");
      else if (msg.includes("rate limit"))
        setError("Rate limit exceeded. Please wait a moment and try again.");
      else setError(e.message || "Something went wrong. Please try again.");
    }
  };

  // Loading carousel view
  if (loading) {
    const currentSlide = LOADING_SLIDES[slideIndex];
    return (
      <div className="gen-root gen-root--loading page-enter">
        <div className="gen-glow" />

        <div className="loading-header loading-header--sticky">
          <svg className="loading-spinner loading-spinner--spin" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i * 36) * Math.PI / 180;
              const x1 = 18 + Math.cos(angle) * 6;
              const y1 = 18 + Math.sin(angle) * 6;
              const x2 = 18 + Math.cos(angle) * 15;
              const y2 = 18 + Math.sin(angle) * 15;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#F2CC6B" strokeWidth="2.8" strokeLinecap="round"
                  opacity={0.35 + (i / 10) * 0.65} />
              );
            })}
          </svg>
          <span className="loading-header-text">Generating your Membership</span>
        </div>

        <div
          key={`title-${slideIndex}`}
          className={`loading-title-section loading-crossfade ${slidePhase === "in" ? "crossfade-in" : "crossfade-out"}`}
        >
          <h2 className="loading-slide-title loading-stagger-1">{currentSlide.title}</h2>
        </div>

        <div
          key={`img-${slideIndex}`}
          className={`loading-carousel ${currentSlide.type === "card" ? "loading-carousel--card" : ""} loading-crossfade ${slidePhase === "in" ? "crossfade-in" : "crossfade-out"}`}
        >
          <div className={`loading-chart-wrap loading-stagger-2 ${currentSlide.type === "card" ? "loading-chart-wrap--card" : ""}`}>
            <img src={currentSlide.img} alt={currentSlide.key} className={currentSlide.imgClass} loading="eager" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gen-root gen-root--top page-enter">
      <div className="gen-glow" />
      {/* <button className="gen-home-btn" onClick={() => navigate("/")} type="button">
        <Home size={20} />
      </button> */}
      <div className="gen-card gen-card--top">
        <h2 className="gen-title">
          Let's build your brand's<br />membership.
        </h2>

        <div className="gen-field" ref={dropdownRef}>
          <label className="gen-label">Restaurant name</label>
          <div className="gen-input-wrap">
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search your restaurant name"
              autoComplete="off"
              autoCorrect="off"
              className="gen-input gen-input--has-clear"
            />
            {searchQuery && (
              <button
                type="button"
                className="gen-input-clear"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRestaurant(null);
                  setSuggestions([]);
                  setShowDropdown(false);
                  setError("");
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
          {suggestLoading && <div className="gen-search-loading">Searching...</div>}

          {!selectedRestaurant && showDropdown && suggestions.length > 0 && (
            <div className="gen-dropdown">
              {suggestions.map((item) => (
                <button key={item.place_id} onClick={() => handleSelectSuggestion(item)} className="gen-dropdown-item">
                  <div className="gen-dropdown-name">{item.name}</div>
                  <div className="gen-dropdown-addr">{item.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRestaurant && (
          <div className="gen-confirm">
            <div className="gen-confirm-name">✅ {selectedRestaurant.name}</div>
            <div className="gen-confirm-detail">{selectedRestaurant.address}</div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedRestaurant}
          className="gen-cta"
        >
          Show my membership
          <span className="gen-cta-arrow">→</span>
        </button>

        {error && <p className="gen-error">❌ {error}</p>}
      </div>
    </div>
  );
}
