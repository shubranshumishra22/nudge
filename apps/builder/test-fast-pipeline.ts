import { runFastPipeline } from './lib/pipeline/v1-fast';

async function main() {
  const mockInput = {
    business_name: "The Daily Grind",
    business_type: "cafe" as const,
    description: "A cozy artisanal coffee shop serving organic, single-origin brews and fresh sourdough pastries in Bandra, Mumbai.",
    primary_color: "#4a332d",
    products: [
      { name: "Cold Brew", price: 250, description: "Slow-steeped organic coffee served over ice" },
      { name: "Croissant", price: 180, description: "Flaky, buttery twice-baked French croissant" },
      { name: "Espresso", price: 150, description: "Double shot of our signature house roast" }
    ]
  };

  console.log("Starting fast pipeline local test...");
  const startTime = Date.now();

  try {
    const result = await runFastPipeline(mockInput);
    const duration = Date.now() - startTime;

    console.log("-----------------------------------------");
    console.log(`Pipeline Completed in ${duration}ms (${(duration / 1000).toFixed(2)} seconds)`);
    console.log(`Success: ${result.success}`);
    console.log(`Models Used: ${result.models_used.join(', ')}`);
    console.log(`Research tone: ${result.research.tone}`);
    console.log(`Design primary color: ${result.design.primary_color}`);
    console.log(`Content hero headline: ${result.content.hero_headline}`);
    console.log(`QA passed: ${result.qa.passed}`);
    console.log(`Issues found: ${result.qa.issues_found.length}`);
    console.log(`HTML Length: ${result.build.html.length} characters`);
    console.log("-----------------------------------------");

    if (result.qa.html.trim().startsWith('<!DOCTYPE html>')) {
      console.log("✓ HTML starts with valid doctype");
    } else {
      console.error("✗ HTML DOES NOT start with valid doctype!");
    }
  } catch (error) {
    console.error("Pipeline test failed with error:", error);
  }
}

main().catch(console.error);
