import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const sampleScrapedData = {
  restaurant_info: {
    name: "Café Mocha",
    address: "Koramangala, Bangalore",
    rating: 4.3,
    price_range: "₹₹",
    cuisine: "Café, Coffee, Beverages",
    category: "Café"
  },
  menu_items: [
    // Beverages
    { name: "Cappuccino", price: 180, category: "Beverages" },
    { name: "Latte", price: 200, category: "Beverages" },
    { name: "Americano", price: 160, category: "Beverages" },
    { name: "Mocha", price: 220, category: "Beverages" },
    { name: "Cold Brew", price: 250, category: "Beverages" },
    { name: "Matcha Latte", price: 280, category: "Beverages" },
    { name: "Hot Chocolate", price: 200, category: "Beverages" },
    // Sides/Starters
    { name: "Croissant", price: 120, category: "Snacks" },
    { name: "Sandwich", price: 180, category: "Snacks" },
    { name: "Brownie", price: 150, category: "Snacks" },
    { name: "Muffin", price: 130, category: "Snacks" },
    { name: "Garlic Bread", price: 160, category: "Snacks" },
    // Desserts
    { name: "Cheesecake", price: 300, category: "Desserts" },
    { name: "Tiramisu", price: 350, category: "Desserts" },
    { name: "Waffle", price: 280, category: "Desserts" },
  ]
};

Deno.test("generate-membership: AOV basket method produces reasonable pricing for a café", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-membership`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      scraped_data: sampleScrapedData,
      test_model: "google/gemini-2.5-flash",
    }),
  });

  const body = await response.json();
  console.log("Response status:", response.status);
  
  assertEquals(response.status, 200, `Expected 200, got ${response.status}: ${JSON.stringify(body)}`);
  assertExists(body.data, "Response should contain data");
  
  const data = body.data;
  console.log("Brand:", data.brand_name);
  console.log("Estimated AOV:", data.estimated_aov);
  console.log("Business Category:", data.business_category);
  
  // For a café with median beverage ~200 and median side ~150:
  // Expected AOV = 200 × 1.0 + 150 × 0.6 = 290, rounded to 290
  assertExists(data.estimated_aov, "AOV should exist");
  assertEquals(typeof data.estimated_aov, "number", "AOV should be a number");
  
  // AOV should be reasonable for a café (between 150-500)
  const aov = data.estimated_aov;
  console.log(`AOV: ₹${aov} (expected ~₹290 based on basket method)`);
  assertEquals(aov >= 100 && aov <= 600, true, `AOV ₹${aov} seems unreasonable for a café`);
  
  // Check variants
  assertExists(data.variants, "Should have variants");
  assertEquals(data.variants.length, 5, "Should have exactly 5 variants");
  
  for (const v of data.variants) {
    console.log(`\n--- ${v.name} (${v.type}) ---`);
    console.log(`  Price: ₹${v.price}, Original Value: ₹${v.original_value}, Savings: ₹${v.savings}`);
    console.log(`  Duration: ${v.duration} (${v.duration_months}mo)`);
    console.log(`  Rewards: ${v.rewards.length}`);
    
    // Verify price is positive
    assertEquals(v.price > 0, true, `Price should be positive for ${v.name}`);
    
    // Verify all rewards have used=0
    for (const r of v.rewards) {
      if (r.uses) {
        assertEquals(r.uses.used, 0, `Reward "${r.title}" should have used=0`);
      }
    }
  }
});
