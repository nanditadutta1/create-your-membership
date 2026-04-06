// import { useEffect, useRef } from "react";

// export default function HubspotForm() {
//   const formRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "//js.hsforms.net/forms/embed/v2.js";
//     script.async = true;

//     script.onload = () => {
//       if ((window as any).hbspt) {
//         (window as any).hbspt.forms.create({
//           portalId: "23459474",
//           formId: "0e8f138e-5b4d-4fa5-a0e4-4d949c02fe5f",
//           region: "na2",
//           target: "#hubspotForm"
//         });
//       }
//     };

//     document.body.appendChild(script);
//   }, []);

//   return <div id="hubspotForm" ref={formRef}></div>;
// }

import { useEffect, useId, useMemo, useState } from "react";

interface HubspotFormProps {
  portalId?: string;
  formId?: string;
  region?: string;
  onFormReady?: () => void;
  onFormSubmit?: () => void;
  onFormSubmitted?: () => void;
  onFormError?: (error: unknown) => void;
  className?: string;
}

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const HUBSPOT_SCRIPT_ID = "hs-forms-script-v2";

function loadHubspotScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.hbspt?.forms) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(HUBSPOT_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("HubSpot script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = HUBSPOT_SCRIPT_ID;
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("HubSpot script failed to load"));
    document.body.appendChild(script);
  });
}

export default function HubspotForm({
  portalId = "23459474",
  formId = "0e8f138e-5b4d-4fa5-a0e4-4d949c02fe5f",
  region = "na1",
  onFormReady,
  onFormSubmit,
  onFormSubmitted,
  onFormError,
  className,
}: HubspotFormProps) {
  const reactId = useId();
  const targetId = useMemo(() => `hubspot-form-${reactId.replace(/[:]/g, "")}`, [reactId]);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const mountForm = async () => {
      try {
        await loadHubspotScript();
        if (!mounted || !window.hbspt?.forms) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        target.innerHTML = "";
        window.hbspt.forms.create({
          portalId,
          formId,
          region,
          target: `#${targetId}`,
          onFormReady: () => {
            onFormReady?.();
            console.info("[HubSpot] form ready");
          },
          onFormSubmit: () => {
            onFormSubmit?.();
            console.info("[HubSpot] onFormSubmit triggered");
          },
          onFormSubmitted: () => {
            onFormSubmitted?.();
            console.info("[HubSpot] onFormSubmitted triggered");
          },
        });
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Unable to load HubSpot form.";
        setFormLoadError(message);
        onFormError?.(error);
        console.error("[HubSpot] form initialization failed", error);
      }
    };

    mountForm();

    return () => {
      mounted = false;
      const target = document.getElementById(targetId);
      if (target) target.innerHTML = "";
    };
  }, [formId, onFormError, onFormReady, onFormSubmit, onFormSubmitted, portalId, region, targetId]);

  if (formLoadError) {
    return (
      <div className={className}>
        <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>
          Unable to load the form right now. Please try again.
        </p>
      </div>
    );
  }

  return <div id={targetId} className={className} />;
}