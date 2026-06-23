import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

function generateFallbackHtml(store: any): string {
  const dt = store.design_tokens || {};
  const c = store.content || {};
  const name = store.name || 'My Store';
  const primary = dt.primary_color || '#4F46E5';
  const accent = dt.accent_color || '#F59E0B';
  const bg = dt.background_color || '#FFFFFF';
  const textColor = dt.text_color || '#1F2937';
  const headingFont = dt.font_heading || 'Georgia, serif';
  const bodyFont = dt.font_body || 'system-ui, sans-serif';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.seo_title || name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; padding: 0; }
    :root { --primary: ${primary}; --accent: ${accent}; --bg: ${bg}; --text: ${textColor}; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${bodyFont}; color: var(--text); background: var(--bg); line-height: 1.6; }
    header { position: sticky; top: 0; background: var(--primary); color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
    .logo { font-family: ${headingFont}; font-size: 1.5rem; font-weight: 700; }
    nav a { color: white; text-decoration: none; margin-left: 1.5rem; opacity: 0.9; }
    nav a:hover { opacity: 1; }
    #hero { min-height: calc(100vh - 48px); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 2rem; background: linear-gradient(135deg, var(--primary)15, transparent); }
    #hero h1 { font-family: ${headingFont}; font-size: 3rem; margin-bottom: 1rem; }
    #hero p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.8; }
    .btn { background: var(--accent); color: white; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; }
    #products { padding: 4rem 2rem; }
    #products h2 { font-family: ${headingFont}; text-align: center; margin-bottom: 2rem; font-size: 2rem; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .product-card { border: 1px solid #eee; border-radius: 12px; padding: 1.5rem; text-align: center; }
    .product-card h3 { margin-bottom: 0.5rem; }
    .product-card .price { font-size: 1.3rem; font-weight: 700; color: var(--primary); margin: 1rem 0; }
    .product-card .add-to-cart { width: 100%; padding: 0.7rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; }
    #about { padding: 4rem 2rem; background: #f8f9fa; text-align: center; }
    #about h2 { font-family: ${headingFont}; margin-bottom: 1rem; }
    #contact { padding: 3rem 2rem; text-align: center; }
    footer { text-align: center; padding: 2rem; color: #666; border-top: 1px solid #eee; font-size: 0.9rem; }
    @media (max-width: 768px) { #hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <header>
    <div class="logo">${name}</div>
    <nav><a href="#products">Shop</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
  </header>
  <section id="hero">
    <h1>${c.hero_headline || 'Welcome to ' + name}</h1>
    <p>${c.hero_subheadline || 'Discover our collection'}</p>
    <button class="btn">${c.hero_cta || 'Shop Now'}</button>
  </section>
  <section id="products">
    <h2>${c.products_section_title || 'Our Products'}</h2>
    <div class="product-grid">
      <div class="product-card"><h3>Product</h3><p class="price">₹--</p><button class="add-to-cart">Add to Cart</button></div>
    </div>
  </section>
  <section id="about">
    <h2>${c.about_title || 'About Us'}</h2>
    <p>${c.about_body || 'We are dedicated to providing the best products and service to our community.'}</p>
  </section>
  <section id="contact">
    <h2>Get in Touch</h2>
    <p>${c.contact_tagline || 'We would love to hear from you!'}</p>
  </section>
  <footer><p>${c.footer_tagline || 'Powered by Nudge'}</p></footer>
  <script>
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'highlight') {
        document.querySelectorAll('.nudge-updating').forEach(el => el.classList.remove('nudge-updating'));
        const target = document.getElementById(e.data.section);
        if (target) { target.classList.add('nudge-updating'); setTimeout(() => target.classList.remove('nudge-updating'), 3000); }
      }
    });
  </script>
</body>
</html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  if (!storeId) {
    return new NextResponse('store_id required', { status: 400 });
  }

  const supabase = getSupabase();

  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (storeErr || !store) {
    return new NextResponse('Store not found', { status: 404 });
  }

  // Try to load from storage first
  const { data: file, error: fileErr } = await supabase.storage
    .from('storefronts')
    .download(`${storeId}/index.html`);

  let html: string;

  if (!fileErr && file) {
    html = await file.text();
  } else {
    // Generate fallback HTML from store data so preview always works
    html = generateFallbackHtml(store);
  }

  // Normalize layout: fix top spacing in stored HTML
  // 1. Ensure html/body have no default margin/padding
  if (!html.includes('html{margin:0;padding:0}') && !html.includes('html,body{margin:0')) {
    html = html.replace(/<style[^>]*>/i, (match) => `${match}html,body{margin:0;padding:0}`);
  }
  // 2. Fix hero min-height to account for 64px sticky header
  html = html.replace(/min-h-\[70vh\]/g, 'min-h-[calc(100vh-64px)]');
  // 3. Remove any mt-* classes from hero section that push content down
  html = html.replace(/(<section[^>]*id="hero"[^>]*)\s+mt-\d+/g, '$1');

  // Inject postMessage listener for section highlights
  const injection = `
<script>
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'highlight') {
      document.querySelectorAll('.nudge-updating').forEach(el => el.classList.remove('nudge-updating'));
      const target = document.getElementById(e.data.section);
      if (target) {
        target.classList.add('nudge-updating');
        setTimeout(() => target.classList.remove('nudge-updating'), 3000);
      }
    }
  });
</script>
<style>
  .nudge-updating { outline: 3px solid ${store.design_tokens?.accent_color || '#F59E0B'}; outline-offset: 2px; border-radius: 4px; transition: outline 0.2s; }
</style>
`;

  const finalHtml = html.includes('nudge-updating')
    ? html
    : html.replace(/<\/body>/i, `${injection}</body>`);

  return new NextResponse(finalHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store'
    }
  });
}
