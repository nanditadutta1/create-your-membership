import React from "react";
import "./PrepaidWalletAddedBenefitCard.scss";

interface PrepaidWalletAddedBenefitCardProps {
  currencyView: string;
  currMemb: {
    wallet_amount: {
      pay: number;
      get: number;
    };
    landing_page_settings: {
      colors: {
        theme: string;
      };
    };
  };
  isMembershipListingPage: boolean;
}

const PrepaidWalletAddedBenefitCard: React.FC<PrepaidWalletAddedBenefitCardProps> = ({
  currencyView,
  currMemb,
  isMembershipListingPage,
}) => {
  const pay = currMemb.wallet_amount.pay;
  const get = currMemb.wallet_amount.get;
  const themeColor = currMemb.landing_page_settings.colors.theme;

  const isHigh = pay >= 10000 || get >= 10000;
  const isExtraHigh = pay >= 100000 || get >= 100000;

  const rootClasses = [
    "prepaid-wallet-amount-card",
    isMembershipListingPage && "listing-page",
    isExtraHigh ? "extra-high-wallet-amount-card" : isHigh ? "high-wallet-amount-card" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cutoutBg = isMembershipListingPage ? themeColor : "#f6f6f6";

  return (
    <div
      className={rootClasses}
      style={{
        ["--cutout-bg" as string]: cutoutBg,
      }}
    >
      {/* Ticket cutout overrides via inline style */}
      <style>{`
        .${isMembershipListingPage ? "listing-page" : ""}::before,
        .${isMembershipListingPage ? "listing-page" : ""}::after {
          background: ${cutoutBg} !important;
        }
      `}</style>

      <div className="ticket-divider" />

      <div className="wallet-pay">
        <span className="label">You pay</span>
        <span className="wallet-card-value">
          {currencyView}
          {pay.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="wallet-get">
        <div className="wallet-get-left">
          <span className="label">You get</span>
          <span className="wallet-card-value">
            {currencyView}
            {get.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="wallet-get-right">
          <img
            src="/assets/images/membership/wallet.png"
            alt="Wallet"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PrepaidWalletAddedBenefitCard;
