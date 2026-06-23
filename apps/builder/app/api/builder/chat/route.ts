import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { classifyMessage } from '@/lib/builder/intentParser';
import { runBuilderAgent, getFallbackResponse } from '@/lib/builder/builderAgent';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function buildStartingHtml(store: any): string {
  const dt = store.design_tokens || {};
  const c = store.content || {};
  const name = store.name || 'My Store';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.seo_title || name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>html,body{margin:0;padding:0}:root{--primary:${dt.primary_color||'#4F46E5'};--accent:${dt.accent_color||'#F59E0B'}}.nudge-updating{outline:3px solid var(--accent);outline-offset:2px;border-radius:4px}</style>
</head>
<body class="bg-white text-gray-900 font-sans antialiased">
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <span class="text-xl font-bold">${name}</span>
      <nav class="flex gap-6 text-sm font-medium text-gray-600">
        <a href="#products">Products</a><a href="#about">About</a><a href="#contact">Contact</a>
      </nav>
    </div>
  </header>
  <section id="hero" class="min-h-[calc(100vh-64px)] flex items-center justify-center text-center px-4 bg-gradient-to-b from-gray-50 to-white">
    <div><h1 class="text-4xl md:text-5xl font-bold mb-4">${c.hero_headline||'Welcome to '+name}</h1><p class="text-lg text-gray-600 mb-8">${c.hero_subheadline||'Discover our products'}</p><button class="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition">${c.hero_cta||'Shop Now'}</button></div>
  </section>
  <section id="products" class="py-16 px-4">
    <div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-10">${c.products_section_title||'Our Products'}</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8"></div></div>
  </section>
  <section id="about" class="py-16 px-4 bg-gray-50">
    <div class="max-w-3xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">${c.about_title||'About Us'}</h2><p class="text-gray-600">${c.about_body||'We are dedicated to providing the best products and service to our community.'}</p></div>
  </section>
  <section id="contact" class="py-16 px-4 text-center">
    <h2 class="text-3xl font-bold mb-4">Get in Touch</h2>
    <p class="text-gray-600 mb-6">${c.contact_tagline||'We would love to hear from you!'}</p>
    <a href="https://wa.me/91xxxxxxxxxx" class="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition">Message us on WhatsApp</a>
  </section>
  <footer class="py-8 text-center text-sm text-gray-500 border-t"><p>${c.footer_tagline||'Powered by Nudge'}</p></footer>
  <script>window.addEventListener('message',function(e){if(e.data&&e.data.type==='highlight'){document.querySelectorAll('.nudge-updating').forEach(el=>el.classList.remove('nudge-updating'));const t=document.getElementById(e.data.section);if(t){t.classList.add('nudge-updating');setTimeout(()=>t.classList.remove('nudge-updating'),3000);}}})</script>
</body>
</html>`;
}

const encoder = new TextEncoder();

function sse(obj: unknown) {
  return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(req: Request) {
  const { store_id, message, history } = await req.json();
  if (!store_id || !message) {
    return new NextResponse('Missing store_id or message', { status: 400 });
  }

  const supabase = getSupabase();

  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('*')
    .eq('id', store_id)
    .single();

  if (storeErr || !store) {
    return new NextResponse('Store not found', { status: 404 });
  }

  let currentHtml = '';
  const { data: htmlFile } = await supabase.storage
    .from('storefronts')
    .download(`${store_id}/index.html`);
  if (htmlFile) {
    currentHtml = await htmlFile.text();
  }
  if (!currentHtml) {
    currentHtml = buildStartingHtml(store);
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Classify intent (fast) — send status before
      controller.enqueue(sse({ status: 'analyzing', label: 'Analyzing your request...' }));
      await new Promise(r => setTimeout(r, 500));

      let intentInfo: any;
      try {
        intentInfo = await classifyMessage(message);
      } catch {
        intentInfo = { intent: 'question', target_section: null, confidence: 0 };
      }

      controller.enqueue(sse({ status: 'generating', label: 'Designing your store...' }));
      await new Promise(r => setTimeout(r, 400));

      // Build options and run agent
      const agentOpts = {
        intent: intentInfo.intent,
        targetSection: intentInfo.target_section,
        storeHtml: currentHtml,
        designTokens: store.design_tokens,
        content: store.content,
        conversationHistory: [...(history || []), { role: 'user', content: message }],
      };

      let agentResult: any;
      try {
        agentResult = await runBuilderAgent(agentOpts);
      } catch (e: any) {
        console.error('Builder agent failed:', e?.message || e);
        agentResult = getFallbackResponse(agentOpts);
      }

      // Persist updated HTML
      let saved = false;
      if (agentResult.updatedHtml && agentResult.updatedHtml !== currentHtml) {
        const { error: uploadErr } = await supabase.storage
          .from('storefronts')
          .upload(`${store_id}/index.html`, new Blob([agentResult.updatedHtml], { type: 'text/html' }), {
            upsert: true,
            contentType: 'text/html',
          });
        if (uploadErr) {
          console.error('Storage upload error:', uploadErr);
        } else {
          saved = true;
        }
      }

      const htmlChanged = agentResult.updatedHtml && agentResult.updatedHtml !== currentHtml;

      // Send applying status if there were changes
      if (htmlChanged) {
        controller.enqueue(sse({ status: 'applying', label: 'Applying changes to your store...' }));
        await new Promise(r => setTimeout(r, 500));
      }

      // Stream conversational response tokens
      const tokens = agentResult.response.split(/\s+/);
      for (let i = 0; i < tokens.length; i++) {
        controller.enqueue(sse({ token: tokens[i] + (i < tokens.length - 1 ? ' ' : '') }));
        await new Promise(r => setTimeout(r, 25));
      }

      // Final event
      controller.enqueue(sse({
        done: true,
        updated_section: agentResult.updatedSection,
        preview_reload: htmlChanged,
        saved,
      }));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
