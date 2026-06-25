import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { runPipeline } from "@/lib/pipeline";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function fontStyleFromHeading(fontHeading: string): 'modern' | 'classic' | 'playful' | 'minimal' {
  const normalized = fontHeading.toLowerCase();
  if (normalized.includes('playfair') || normalized.includes('serif')) return 'classic';
  if (normalized.includes('comic') || normalized.includes('cursive')) return 'playful';
  if (normalized.includes('inter') || normalized.includes('system')) return 'modern';
  return 'minimal';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export const generateStoreFunction = inngest.createFunction(
  { 
    id: "generate-store", 
    name: "Generate Storefront Background Job",
    triggers: [
      { event: "store/generate.requested" }
    ]
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { storeId, userId, input, slug } = event.data;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Update store status to generating and set started_at timestamp
    await step.run("initialize-store-status", async () => {
      const { error } = await db
        .from("stores")
        .update({
          status: "generating",
          generation_started_at: new Date().toISOString(),
        })
        .eq("id", storeId);
      if (error) throw error;
    });

    // 2. Run the V3 pipeline
    const result = await step.run("run-v3-pipeline", async () => {
      return await runPipeline(input);
    });

    // 3. Process result and update database
    await step.run("finalize-storefront", async () => {
      if (result.success) {
        // Insert theme from design output
        const { error: themeError } = await db.from('store_themes').insert({
          store_id: storeId,
          primary_color: result.design.primary_color,
          accent_color: result.design.accent_color,
          background_color: result.design.background_color,
          font_style: fontStyleFromHeading(result.design.font_heading),
          hero_headline: result.content.hero_headline,
          hero_subheading: result.content.hero_subheadline,
          sections_order: result.research.common_sections,
          sections_enabled: {
            hero: true,
            products: true,
            about: true,
            contact: true,
          },
        });

        if (themeError) {
          console.error('Theme creation failed in background job:', themeError);
        }

        // Insert products
        for (let i = 0; i < input.products.length; i++) {
          const p = input.products[i];
          const { data: product, error: productError } = await db.from('products').insert({
            store_id: storeId,
            name: p.name,
            slug: slugify(p.name),
            description: p.description || '',
            price: p.price,
            category: input.business_type,
            is_featured: i === 0,
            sort_order: i,
          }).select('id').single();

          if (productError) {
            console.error('Product creation failed in background job:', productError);
          } else if (product && p.image_url) {
            const { error: imageError } = await db.from('product_images').insert({
              product_id: product.id,
              url: p.image_url,
              alt_text: p.name,
              sort_order: 0,
              is_primary: true,
            });

            if (imageError) {
              console.error('Product image creation failed in background job:', imageError);
            }
          }
        }

        // Save generated HTML to storage
        const { error: uploadError } = await db.storage
          .from('storefronts')
          .upload(`${storeId}/index.html`, new Blob([result.build.html], { type: 'text/html' }), {
            upsert: true,
            contentType: 'text/html',
          });

        if (uploadError) {
          console.error('HTML upload failed in background job:', uploadError);
        }

        // Update store details, status, and config last to signal completion
        const { error: storeUpdateError } = await db
          .from('stores')
          .update({
            status: 'draft',
            ai_config: result as unknown as Record<string, unknown>,
            generation_completed_at: new Date().toISOString(),
            generation_score: result.final_score || 9.0,
          })
          .eq('id', storeId);

        if (storeUpdateError) {
          throw storeUpdateError;
        }

        // Log generation
        await db.from('ai_generation_logs').insert({
          owner_id: userId,
          store_id: storeId,
          input_payload: input as unknown as Record<string, unknown>,
          output_config: result as unknown as Record<string, unknown>,
          model_used: result.models_used.join(', '),
          tokens_used: null,
          duration_ms: result.duration_ms,
          success: true,
          error_message: null,
        });
      } else {
        // Failure handling
        // Partial failure — save whatever we have
        await db.storage
          .from('storefronts')
          .upload(`${storeId}/index.html`, new Blob([result.build.html], { type: 'text/html' }), {
            upsert: true,
            contentType: 'text/html',
          });

        // Update store details with config (which has error message)
        await db
          .from('stores')
          .update({
            status: 'draft',
            ai_config: result as unknown as Record<string, unknown>,
            generation_completed_at: new Date().toISOString(),
            generation_score: 1.0,
          })
          .eq('id', storeId);

        await db.from('ai_generation_logs').insert({
          owner_id: userId,
          store_id: storeId,
          input_payload: input as unknown as Record<string, unknown>,
          output_config: result as unknown as Record<string, unknown>,
          model_used: result.models_used.join(', '),
          tokens_used: null,
          duration_ms: result.duration_ms,
          success: false,
          error_message: result.error || 'Unknown error',
        });
      }
    });

    return { success: result.success };
  }
);
