import { useState, useEffect } from "react";
import MembershipLanding from "@/components/MembershipLanding";

const Index = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 430);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 430);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "linear-gradient(135deg, #E16199, #000000)" }}>
        <MembershipLanding />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E16199, #000000)",
        padding: "40px 20px",
      }}
    >
      {/* iPhone 15 Pro Frame */}
      <div
        style={{
          position: "relative",
          width: 393,
          height: 852,
          borderRadius: 54,
          background: "hsl(0,0%,5%)",
          boxShadow:
            "0 0 0 2px hsl(0,0%,15%), 0 0 0 4px hsl(0,0%,8%), 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px hsl(0,0%,12%)",
          overflow: "hidden",
        }}
      >
        {/* Side buttons */}
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 180,
            width: 3,
            height: 32,
            background: "hsl(0,0%,12%)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 240,
            width: 3,
            height: 60,
            background: "hsl(0,0%,12%)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 310,
            width: 3,
            height: 60,
            background: "hsl(0,0%,12%)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -3,
            top: 260,
            width: 3,
            height: 80,
            background: "hsl(0,0%,12%)",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Inner screen */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            borderRadius: 50,
            overflow: "hidden",
            background: "hsl(220,10%,7%)",
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 126,
              height: 36,
              borderRadius: 100,
              background: "#000",
              zIndex: 100,
            }}
          />

          {/* Scrollable content */}
          <div
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <MembershipLanding />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
