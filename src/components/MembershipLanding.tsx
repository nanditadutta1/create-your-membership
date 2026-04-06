import { useState, useEffect, useRef, CSSProperties, useMemo } from "react";
import { MembershipLandingProps } from "@/types/membership";
import PrepaidWalletAddedBenefitCard from "@/components/PrepaidWalletAddedBenefitCard/PrepaidWalletAddedBenefitCard";
import HubspotForm from "./HubspotForm";
import html2canvas from 'html2canvas';

/* ─── Design Tokens ─── */
const T = {
  gold: "hsl(45,80%,55%)",
  goldDark: "hsl(45,70%,40%)",
  green: "hsl(145,60%,45%)",
  bg: "hsl(220,10%,7%)",
  card: "hsl(220,8%,12%)",
  cardLight: "hsl(40,20%,90%)",
  text: "hsl(0,0%,95%)",
  textMuted: "hsl(220,10%,55%)",
  textDim: "hsl(220,10%,40%)",
  border: "hsl(220,10%,18%)",
  serif: "'Gambarino', 'Cormorant Garamond', Georgia, serif",
  sans: "'DM Sans', 'Helvetica Neue', Helvetica, sans-serif",
};

/* ─── Default Data ─── */
const DEFAULT_MEMBERSHIP = {
  brandInitials: "Ann",
  title: "Ann Deluxe Pack",
  subtitle: "Exclusive benefits curated just for you",
  price: 1999,
  originalPrice: 2499,
  savings: 20000,
  validity: "4 months",
  benefits: [
    { id: 1, type: "discount" as const, title: "20% off on all orders", desc: "Valid on orders above ₹500", emoji: "💰", uses: { used: 2, total: 5 } },
    { id: 2, type: "freebie" as const, title: "Free dessert on birthday", desc: "Any dessert from the menu", emoji: "🎁", uses: { used: 0, total: 1 } },
    { id: 3, type: "perk" as const, title: "Priority reservations", desc: "Skip the queue, always", emoji: "⭐", uses: null },
    { id: 4, type: "points" as const, title: "2X reward points", desc: "On every purchase you make", emoji: "✨", uses: null },
  ],
  activities: [
    { id: 1, title: "Used 20% discount", date: "12 Jan 2025", amount: "-₹200" },
    { id: 2, title: "Used 20% discount", date: "5 Jan 2025", amount: "-₹350" },
    { id: 3, title: "Membership purchased", date: "1 Jan 2025", amount: "₹1,999" },
  ],
  stores: [
    { id: 1, name: "Ann's Bakery — Indiranagar", address: "12th Main, Indiranagar", distance: "1.2 km" },
    { id: 2, name: "Ann's Bakery — Koramangala", address: "80 Feet Road, Koramangala", distance: "3.5 km" },
    { id: 3, name: "Ann's Bakery — HSR Layout", address: "Sector 7, HSR Layout", distance: "5.1 km" },
    { id: 4, name: "Ann's Bakery — Jayanagar", address: "4th Block, Jayanagar", distance: "6.8 km" },
  ],
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
};

/* ─── Animations (injected as <style>) ─── */
const KEYFRAMES = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpText { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rotateCw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

/* ─── Helpers ─── */
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

/* ─── Sub-Components ─── */

function Header({ restaurantName, title, subtitle, themeColor, fontColor, logoUrl }: { restaurantName?: string; title: string; subtitle: string; themeColor: string; fontColor: string; logoUrl?: string }) {
  return (
    <div
      style={{
        backgroundColor: themeColor,
        padding: "16px 16px 170px",
        textAlign: "center" as const,
      }}
    >
      {/* Notch */}
      <div
        style={{
          height: 36,
          width: 126,
          margin: "0 auto 10px",
          borderRadius: 100,
          background: "#000",
        }}
      />

      {/* Logo Circle */}
      {logoUrl && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 12px",
            border: `2px solid ${fontColor}`,
            background: "#fff",
          }}
        >
          <img
            src={logoUrl}
            alt="Brand logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Restaurant Name */}
      <div
        style={{
          fontFamily: T.sans,
          fontSize: 18,
          fontWeight: 700,
          color: fontColor,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          marginBottom: 26,
        }}
      >
        {restaurantName || "Restaurant"}
      </div>

      {/* Membership name */}
      <h1
        style={{
          fontFamily: "'Gambarino', 'Cormorant Garamond', Georgia, serif",
          fontSize: 38,
          color: fontColor,
          fontWeight: 400,
          textAlign: "center" as const,
          marginBottom: 12,
          marginTop: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: 12,
          color: fontColor,
          opacity: 0.9,
          textAlign: "center" as const,
          marginBottom: 24,
          marginTop: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
          lineHeight: 1.5,
          fontFamily: T.sans,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function CustomerSavingAmountCard({ savings }: { savings: number }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "14px 20px",
        textAlign: "center" as const,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 23, color: "#000", fontFamily: T.sans, whiteSpace: "nowrap" }}>You'll potentially save</span>
      <span style={{ fontFamily: "'Gambarino', 'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap" }}>{fmt(savings)}</span>
    </div>
  );
}

function TicketCard({ price }: { price: number }) {
  const notchSize = 12;
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{
        position: "absolute", left: -notchSize, top: "50%", transform: "translateY(-50%)",
        width: notchSize * 2, height: notchSize * 2, borderRadius: "50%", background: "#fafafa", zIndex: 2,
      }} />
      <div style={{
        position: "absolute", right: -notchSize, top: "50%", transform: "translateY(-50%)",
        width: notchSize * 2, height: notchSize * 2, borderRadius: "50%", background: "#fafafa", zIndex: 2,
      }} />
      <div
        style={{
          background: T.card,
          borderRadius: 16,
          padding: "20px 22px",
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" as const }}>
            <div style={{ fontSize: 10, color: T.textDim, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6, fontFamily: T.sans }}>
              You Pay
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text }}>
              {fmt(price)}
            </div>
          </div>
          <div style={{
            width: 1, height: 60,
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 5px, ${T.textDim} 5px, ${T.textDim} 10px)`,
            margin: "0 4px",
          }} />
          <div style={{ flex: 1, textAlign: "center" as const }}>
            <div style={{ fontSize: 10, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6, fontFamily: T.sans, fontWeight: 600 }}>
              You Get
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text }}>
              {fmt(price + 300)}
            </div>
          </div>
          <div style={{ marginLeft: 8, fontSize: 24, opacity: 0.6 }}>👛</div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ benefit }: { benefit: typeof DEFAULT_MEMBERSHIP.benefits[0] }) {
  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          borderRadius: 12,
          background: benefit.uses && benefit.uses.used >= benefit.uses.total
            ? "rgba(78,78,78,0.3)"
            : "linear-gradient(180deg, #3d3d3d 0%, #080808 142.61%)",
          padding: "18px",
          minHeight: 100,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 19, height: 19, borderRadius: "50%", background: "#fff", right: "26%", top: -8, zIndex: 2 }} />
        <div style={{ position: "absolute", width: 19, height: 19, borderRadius: "50%", background: "#fff", right: "26%", bottom: -8, zIndex: 2 }} />
        <div style={{ position: "absolute", top: 9, bottom: 9, right: "28.2%", width: 2, backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 7px, rgba(255,255,255,0.3) 7px, rgba(255,255,255,0.3) 13px)" }} />

        <div style={{ paddingRight: "30%", overflow: "hidden", wordBreak: "break-word" as const }}>
          <div style={{ fontFamily: "'Gambarino', 'Cormorant Garamond', Georgia, serif", fontSize: 22, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
            {benefit.title}
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {benefit.desc}
          </div>
          {benefit.uses && (
            <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
              {benefit.uses.used} / {benefit.uses.total} uses
            </div>
          )}
        </div>

        <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", fontSize: 36 }}>
          {benefit.emoji}
        </div>

      </div>

      {benefit.uses && (
        <div style={{ marginTop: -30, padding: "40px 16px 16px", borderRadius: "0 0 12px 12px", background: "#fff", border: "1px solid #e0e0e0" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {benefit.uses.total <= 10 ? (
              Array.from({ length: benefit.uses.total }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 8, borderRadius: 4, background: i < benefit.uses!.used ? "#059669" : "#e5e5e5" }} />
              ))
            ) : (
              <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, background: `linear-gradient(90deg, ${T.gold}, ${T.goldDark})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {benefit.uses.total} uses
              </span>
            )}
            <span style={{ fontFamily: T.sans, fontSize: 11, color: "#999", marginLeft: 4 }}>
              {benefit.uses.used}/{benefit.uses.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function TermsAccordion({ terms }: { terms: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: -20, padding: "36px 18px 2px", background: "#d9d9d9", borderRadius: "0 0 24px 24px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: "#333" }}
      >
        Terms & Conditions
        <span style={{ fontSize: 12, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {open && (
        <div style={{ paddingTop: 8, paddingBottom: 12 }}>
          {terms.map((t, i) => (
            <p key={i} style={{ fontFamily: T.sans, fontSize: 12, color: "#666", margin: "0 0 8px", lineHeight: 1.6 }}>
              {i + 1}. {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function FAQs({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: "#333", marginBottom: 16 }}>FAQs</h3>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
          <button
            onClick={() => setActive(active === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: "#333", textAlign: "left" as const }}
          >
            {faq.q}
            <span style={{ fontSize: 12, transition: "transform 0.3s", transform: active === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: 8 }}>▼</span>
          </button>
          {active === i && (
            <div style={{ padding: "0 4px 16px", animation: "slideUpText 0.2s ease-out" }}>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: "#666", margin: 0, lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StoresModal({ stores, onClose }: { stores: typeof DEFAULT_MEMBERSHIP.stores; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.2s ease-out" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "#fff", borderRadius: "12px 12px 0 0", padding: "20px 16px 32px", maxHeight: "70vh", overflowY: "auto", animation: "slideUp 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#ccc", margin: "0 auto 20px" }} />
        <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: "#333", marginBottom: 16 }}>Available Stores</h3>
        {stores.map((s) => (
          <div key={s.id} style={{ background: "#f3f3f3", borderRadius: 18, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: "#888" }}>{s.address}</div>
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: "#aaa", flexShrink: 0, marginLeft: 12 }}>{s.distance}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Purchase Canvas ─── */
type PurchaseStep = "phone" | "thankyou";

function PurchaseCanvas({ brandInitials, title, price, themeColor, onClose, restaurantName, city }: { brandInitials: string; title: string; price: number; themeColor: string; onClose: () => void; restaurantName?: string; city?: string }) {
  const [step, setStep] = useState<PurchaseStep>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitToSheet = async () => {
    setSubmitting(true);
    try {
      const resp = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/submit-lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ phone, email, name, restaurant_name: restaurantName, city }),
        }
      );
      if (!resp.ok) console.error("Failed to submit lead");
    } catch (e) {
      console.error("Error submitting lead:", e);
    } finally {
      setSubmitting(false);
      setStep("thankyou");
    }
  };

  useEffect(() => {
    if (step === "thankyou") {
      const t = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(t);
    }
  }, [step, onClose]);

  const overlayStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease-out" };
  const sheetStyle: CSSProperties = { position: "relative", width: "92%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: "24px 20px 12px", animation: "slideUp 0.3s ease-out", textAlign: "center" as const, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" };
  const inputStyle: CSSProperties = { width: "100%", padding: "16px 18px 16px 56px", borderRadius: 14, border: "1px solid #e0e0e0", background: "#fff", color: "#333", fontFamily: T.sans, fontSize: 16, outline: "none" };
  const emailInputStyle: CSSProperties = { width: "100%", padding: "16px 18px 16px 48px", borderRadius: 14, border: "1px solid #e0e0e0", background: "#fff", color: "#333", fontFamily: T.sans, fontSize: 16, outline: "none", marginTop: 12 };
  const btnStyle: CSSProperties = { width: "100%", padding: "18px", borderRadius: 16, border: "none", background: "#161C1F", color: "#FFFFFF", fontFamily: T.sans, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16 };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        {/* <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", fontSize: 20, color: "#999", cursor: "pointer", lineHeight: 1 }}>✕</button> */}

        {step === "phone" && (
          // <div style={{ animation: "slideUpText 0.3s ease-out" }}>
          //   <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: "#333", marginBottom: 6 }}>Ready To Lead The Prepaid Revolution?</h3>
          //   <p style={{ fontFamily: T.sans, fontSize: 13, color: "#888", marginBottom: 16 }}>Enter your details to get started</p>
          //   <div style={{ position: "relative" }}>
          //     <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontFamily: T.sans, fontSize: 14, color: "#888" }}>👤</span>
          //     <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={{ ...emailInputStyle, marginTop: 0 }} />
          //   </div>
          //   <div style={{ position: "relative" }}>
          //     <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontFamily: T.sans, fontSize: 14, color: "#888" }}>+91</span>
          //     <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setPhone(e.target.value); }} style={{ ...inputStyle, marginTop: 12 }} maxLength={10} />
          //   </div>
          //   <div style={{ position: "relative" }}>
          //     <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontFamily: T.sans, fontSize: 14, color: "#888" }}>✉</span>
          //     <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={emailInputStyle} />
          //   </div>
          //   <button style={btnStyle} onClick={() => name.trim() && phone.length === 10 && email.includes("@") && submitToSheet()} disabled={submitting}>
          //     {submitting ? "Submitting..." : "Launch Your Membership TODAY"}
          //   </button>
          // </div>
          <div style={{ padding: "20px 0", textAlign: "center" }}>

            {/* H1 */}
            <h1
              style={{
                fontFamily: T.serif,
                fontSize: 22,
                fontWeight: 600,
                color: "#333",
                marginBottom: 6,
              }}
            >
              Ready To Lead The Prepaid Revolution?
            </h1>

            {/* H2 */}
            <h2
              style={{
                fontFamily: T.sans,
                fontSize: 13,
                color: "#888",
                marginBottom: 16,
                fontWeight: 400,
              }}
            >
              Enter your details to get started
            </h2>

            {/* HubSpot Form */}
            <HubspotForm
              region="na1"
              onFormSubmitted={() => {
                setStep("thankyou");
              }}
            />
          </div>
        )}

        {step === "thankyou" && (
          <div style={{ animation: "fadeIn 0.5s ease-out", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 600, color: "#333", marginBottom: 8 }}>Thank You!</h3>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: "#888" }}>We'll get in touch with you shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── Main Component ─── */
export default function MembershipLanding(props: MembershipLandingProps) {
  const data = {
    brandInitials: props.brandInitials ?? DEFAULT_MEMBERSHIP.brandInitials,
    title: props.title ?? DEFAULT_MEMBERSHIP.title,
    subtitle: props.subtitle ?? DEFAULT_MEMBERSHIP.subtitle,
    price: props.price ?? DEFAULT_MEMBERSHIP.price,
    originalPrice: props.originalPrice ?? DEFAULT_MEMBERSHIP.originalPrice,
    savings: props.savings ?? DEFAULT_MEMBERSHIP.savings,
    validity: props.validity ?? DEFAULT_MEMBERSHIP.validity,
    benefits: props.benefits ?? DEFAULT_MEMBERSHIP.benefits,
    stores: props.stores ?? DEFAULT_MEMBERSHIP.stores,
    terms: props.terms ?? DEFAULT_MEMBERSHIP.terms,
    faqs: props.faqs ?? DEFAULT_MEMBERSHIP.faqs,
    themeColor: props.themeColor ?? "#FFCB10",
    fontColor: props.fontColor ?? "#FFFFFF",
    variantType: props.variantType,
  };

  const isPrepaidWallet = data.variantType === "Prepaid Wallet";

  const displayBenefits = isPrepaidWallet
    ? data.benefits.filter((b) => !b.title.toLowerCase().includes("credit"))
    : data.benefits;

  const [showPurchase, setShowPurchase] = useState(false);
  const formCompletionKey = useMemo(
    () =>
      `membership_form_completed_${props.restaurantName ?? "default"}`,
    [props.restaurantName]
  );
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(formCompletionKey);
    if (stored === "true") {
      setHasCompletedForm(true);
      setShowPopup(false);
    } else {
      setShowPopup(true);
    }
  }, [formCompletionKey]);

  const handleDownload = () => {
    setShowPopup(false);
    setIsDownloading(true);

    setTimeout(async () => {
      if (mainRef.current) {
        const canvas = await html2canvas(mainRef.current, {
          useCORS: true,
          scale: window.devicePixelRatio || 1,
          backgroundColor: '#fafafa' // Match the background
        });
        const link = document.createElement('a');
        link.download = 'membership-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setIsDownloading(false);
    }, 180);
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div ref={mainRef} style={{ maxWidth: 440, margin: "0 auto", minHeight: "100vh", background: "#fafafa", position: "relative", fontFamily: T.sans, filter: showPopup ? "blur(5px)" : "none", transition: "filter 0.3s ease" }}>
        <Header restaurantName={props.restaurantName} title={data.title} subtitle={data.subtitle} themeColor={data.themeColor} fontColor={data.fontColor} logoUrl={props.logoUrl} />

        <div style={{ margin: "-168px 10px 0", position: "relative", zIndex: 2, paddingBottom: 120 }}>
          <div style={{ animation: "slideUp 0.4s ease-out" }}>
            <CustomerSavingAmountCard savings={data.savings} />
          </div>

          {isPrepaidWallet && (
            <div style={{ marginTop: 40 }}>
              <PrepaidWalletAddedBenefitCard
                currencyView="₹"
                currMemb={{
                  wallet_amount: { pay: data.price, get: data.price + (data.savings || 300) },
                  landing_page_settings: { colors: { theme: data.themeColor } },
                }}
                isMembershipListingPage={false}
              />
            </div>
          )}

          {displayBenefits.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 24, padding: "24px 16px", marginBottom: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ color: T.gold, fontSize: 14 }}>★</span>
                <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#999" }}>
                  {isPrepaidWallet ? "Added Benefit" : "Benefits"}
                </span>
                <span style={{ color: T.gold, fontSize: 14 }}>★</span>
              </div>
              {displayBenefits.map((b) => <BenefitCard key={b.id} benefit={b} />)}
            </div>
          )}

          <TermsAccordion terms={data.terms} />
          <FAQs faqs={data.faqs} />

          <div style={{ marginTop: 32, textAlign: "center" as const }}>
            <p style={{ fontFamily: T.sans, fontSize: 15, color: "#9e9e9e", margin: 0 }}>Contact us on +91 8238369461</p>
          </div>
        </div>

        <div style={{ position: isDownloading ? "relative" : "sticky", bottom: isDownloading ? undefined : 0, left: isDownloading ? undefined : 0, right: isDownloading ? undefined : 0, width: "100%", zIndex: 300 }}>
          <div style={{ background: "linear-gradient(180deg, rgba(250,250,250,0) 15.38%, #fafafa 100%)", padding: "40px 14px 16px" }}>
            <button onClick={handleDownload}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 18, background: "#161C1F", padding: "18px 24px", border: "none", cursor: "pointer" }}>
              <div style={{ textAlign: "left" as const }}>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "#FFFFFF", marginBottom: 2 }}>Valid for {data.validity}</div>
                <div style={{ fontFamily: "'Gambarino', 'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#FFFFFF" }}>Download Now</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "#FFFFFF" }}>only</div>
                <div style={{ fontFamily: "'Gambarino', 'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#FFFFFF" }}>{fmt(data.price)}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showPurchase && (
        <PurchaseCanvas
          brandInitials={data.brandInitials}
          title={data.title}
          price={data.price}
          themeColor={data.themeColor}
          restaurantName={props.restaurantName}
          city={props.city}
          onClose={() => setShowPurchase(false)}
        />
      )}

      {showPopup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ position: "relative", width: "90%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: "24px 20px", animation: "slideUp 0.3s ease-out", textAlign: "center", maxHeight: "90vh", overflowY: "auto" }}>
            <h1 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: "#333", marginBottom: 6 }}>Your Membership is almost ready!</h1>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: "#888", marginBottom: 16 }}>Fill in the details and get access to it.</p>
            <HubspotForm
              region="na1"
              onFormSubmitted={() => {
                setHasCompletedForm(true);
                if (typeof window !== "undefined") {
                  window.localStorage.setItem(formCompletionKey, "true");
                }
                setShowPopup(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
