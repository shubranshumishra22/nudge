import * as fs from 'fs';
import * as path from 'path';

// Load .env.local variables explicitly before any module imports
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

// Dynamically import dependencies so process.env is set
async function test() {
  console.log('[Test] Starting Nudge V3 Pipeline test execution...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { runPipelineV3 } = await import('./lib/pipeline/v3');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result = await runPipelineV3({
      business_name: 'Brew Haven',
      business_type: 'cafe',
      description: 'Cozy specialty coffee shop in Koramangala, Bengaluru',
      primary_color: '#4A2C2A',
      products: [
        { name: 'Espresso', price: 80 },
        { name: 'Cappuccino', price: 120 },
        { name: 'Cold Brew', price: 150 }
      ],
      _store_id: 'test-store-123',
      _slug: 'brew-haven-test'
    } as any, supabase);

    console.log('\n--- V3 Pipeline Execution Results ---');
    console.log('Success:', result.success);
    console.log('Final score:', result.final_score);
    console.log('Threshold:', result.threshold_used);
    console.log('Patch iterations:', result.patch_iterations);
    console.log('Winner worker:', result.winning_worker.worker_id);
    console.log('Winner worker score:', result.winning_worker.score);
    console.log('Winner novelty score:', result.winning_worker.novelty_score);
    console.log('Models used:', result.models_selected);
    console.log('Total time:', result.total_duration_ms + 'ms');
  } catch (err) {
    console.error('Test run crashed with error:', err);
  }
}

test();
