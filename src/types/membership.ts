export interface MembershipReward {
  type: "free_item" | "discount" | "perk";
  title: string;
  description: string;
  emoji: string;
  uses: { used: number; total: number } | null;
}

export interface MembershipVariant {
  id: number;
  name: string;
  emoji: string;
  type: "Reward Bundle" | "Prepaid Wallet";
  duration: string;
  duration_months: number;
  price: number;
  original_value: number;
  value_multiplier: string;
  savings: number;
  target_persona: string;
  rewards: MembershipReward[];
  business_impact: {
    upfront_cash: number;
    visit_increase: string;
    projected_profit: number;
  };
  marketing_message: string;
}

export interface MembershipData {
  brand_name: string;
  brand_initials: string;
  business_category: string;
  cuisine_type: string;
  location: string;
  estimated_aov: number;
  visit_frequency: string;
  avg_rating: number;
  variants: MembershipVariant[];
}

export interface MembershipLandingProps {
  brandInitials?: string;
  logoUrl?: string;
  restaurantName?: string;
  city?: string;
  title?: string;
  subtitle?: string;
  price?: number;
  originalPrice?: number;
  savings?: number;
  validity?: string;
  benefits?: {
    id: number;
    type: "discount" | "freebie" | "perk" | "points";
    title: string;
    desc: string;
    emoji: string;
    uses: { used: number; total: number } | null;
  }[];
  stores?: {
    id: number;
    name: string;
    address: string;
    distance: string;
  }[];
  terms?: string[];
  faqs?: { q: string; a: string }[];
  themeColor?: string;
  fontColor?: string;
  variantType?: "Reward Bundle" | "Prepaid Wallet";
}
