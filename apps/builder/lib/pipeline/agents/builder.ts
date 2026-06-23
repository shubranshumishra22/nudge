import { callModel } from '@/lib/pipeline/utils/callModel';
import { BUILDER_SYSTEM_PROMPT } from '@/lib/pipeline/prompts';
import type { UserInput, DesignOutput, ContentOutput, BuildOutput } from '@/lib/pipeline/types';

export async function runBuilderAgent(
  input: UserInput,
  design: DesignOutput,
  content: ContentOutput,
  products: UserInput['products']
): Promise<BuildOutput> {
  const startTime = Date.now();

  try {
    // Format products for display
    const formattedProducts = products.map(p => ({
      name: p.name,
      price: `₹${p.price.toLocaleString()}`,
      description: p.description || '',
      image_url: p.image_url
    }));

    const imageByType: Record<string, string> = {
      restaurant: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
      cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80',
      bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80',
      clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
      beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80',
      handmade: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80',
      fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
    };
    const heroImage = imageByType[input.business_type] || 'https://images.unsplash.com/photo-1556740772-1a741367c93e?w=1600&q=80';

    const userMessage = `DESIGN TOKENS: ${JSON.stringify(design)}
CONTENT: ${JSON.stringify(content)}
PRODUCTS: ${JSON.stringify(formattedProducts)}
STORE NAME: ${input.business_name}
BUSINESS TYPE: ${input.business_type}
PRIMARY COLOR: ${input.primary_color}
HERO BACKGROUND SUGGESTION: ${heroImage}

For each product, use an Unsplash image that matches the product category or name. Examples:
- Food/drink: https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80
- Fashion/clothing: https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80
- Electronics: https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80
- General product: https://images.unsplash.com/photo-1542296332-2e4473faf563?w=400&q=80

Generate the complete HTML file as described in the system prompt. Use the Emil Kowalski design principles strictly.`;

    const modelResponse = await callModel(
      'openrouter/auto',
      [
        { role: 'system', content: BUILDER_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 8000, temperature: 0.4 }
    );

    let buildOutput: BuildOutput;
    try {
      const parsed = JSON.parse(modelResponse);
      buildOutput = {
        html: parsed.html,
        css: '',
        js: ''
      };

      // Validate HTML starts with DOCTYPE
      if (!buildOutput.html.trim().startsWith('<!DOCTYPE html>')) {
        throw new Error('Generated HTML does not start with DOCTYPE');
      }
    } catch (parseError) {
      throw new Error(`Failed to parse model response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    console.log(`[Builder] ✓ completed in ${Date.now() - startTime}ms`);
    return buildOutput;
  } catch (error) {
    console.error('[Builder] ✗ failed:', error);
    return {
      html: generateFallbackHTML(input, design, content, products),
      css: '',
      js: ''
    };
  }
}

function generateFallbackHTML(
  input: UserInput,
  design: DesignOutput,
  content: ContentOutput,
  products: UserInput['products']
): string {
  const productCards = products
    .map(
      (p) => `
    <div class="product-card">
      <img src="${p.image_url || `https://picsum.photos/seed/${encodeURIComponent(
        p.name
      )}/400/400`}" alt="${p.name}" class="product-image">
      <h3 class="product-name">${p.name}</h3>
      <p class="product-description">${p.description || ''}</p>
      <p class="product-price">₹${p.price.toLocaleString()}</p>
      <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}">
        Add to Cart
      </button>
    </div>`
    )
    .join('');

  const imageByType: Record<string, string> = {
    restaurant: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80',
    clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80',
    handmade: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80',
    fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
  };
  const heroImage = imageByType[input.business_type] || 'https://images.unsplash.com/photo-1556740772-1a741367c93e?w=1600&q=80';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.seo_title}</title>
  <meta name="description" content="${content.seo_description}">
  <link href="https://fonts.googleapis.com/css2?family=${design.font_heading.replace(
    / /g,
    '+'
  )}:wght@300;400;700&family=${design.font_body.replace(
    / /g,
    '+'
  )}:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${design.primary_color};
      --accent: ${design.accent_color};
      --bg: ${design.background_color};
      --text: ${design.text_color};
      --font-heading: '${design.font_heading}', serif;
      --font-body: '${design.font_body}', sans-serif;
      --radius: ${design.border_radius};
      --space: ${design.spacing_unit};
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      opacity: 0;
      animation: fadeIn 0.6s ease forwards;
    }
    @keyframes fadeIn { to { opacity: 1; } }

    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      padding: 1rem 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
    nav { display: flex; gap: 2rem; align-items: center; }
    nav a {
      color: var(--text);
      opacity: 0.7;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: opacity 0.2s ease;
      position: relative;
    }
    nav a::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary);
      transition: width 0.3s ease;
    }
    nav a:hover { opacity: 1; }
    nav a:hover::after { width: 100%; }
    .cart-icon {
      position: relative;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    .cart-icon:hover { background: rgba(0,0,0,0.05); }
    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: transform 0.2s ease;
    }
    .cart-badge.bounce { animation: badgeBounce 0.3s ease; }
    @keyframes badgeBounce { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }

    #hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 6rem 5% 4rem;
      background: linear-gradient(135deg, ${design.primary_color}15 0%, ${design.accent_color}10 100%);
      position: relative;
      overflow: hidden;
    }
    #hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('${heroImage}') center/cover no-repeat;
      opacity: 0.08;
      z-index: 0;
    }
    #hero > * { position: relative; z-index: 1; }
    #hero h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      max-width: 800px;
      margin-bottom: 1.5rem;
      color: var(--text);
    }
    #hero p {
      font-size: clamp(1rem, 2vw, 1.25rem);
      opacity: 0.7;
      max-width: 600px;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

    #products {
      padding: 6rem 5%;
      max-width: 1200px;
      margin: 0 auto;
    }
    #products h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      text-align: center;
      margin-bottom: 3rem;
      letter-spacing: -0.02em;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }
    .product-image {
      width: 100%;
      aspect-ratio: 1/1;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 1.25rem;
      background: #f5f5f5;
    }
    .product-name {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }
    .product-description {
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    .product-price {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1.25rem;
    }
    .add-to-cart {
      width: 100%;
      padding: 0.85rem;
      border-radius: 10px;
      background: var(--primary);
      color: white;
      border: none;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .add-to-cart:hover { opacity: 0.9; transform: scale(1.02); }

    #about {
      padding: 6rem 5%;
      background: rgba(0,0,0,0.02);
      text-align: center;
    }
    #about h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }
    #about p {
      max-width: 700px;
      margin: 0 auto;
      opacity: 0.7;
      font-size: 1.1rem;
      line-height: 1.8;
    }

    #contact {
      padding: 5rem 5%;
      text-align: center;
    }
    #contact h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.5rem, 2.5vw, 2rem);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    #contact p { opacity: 0.7; margin-bottom: 2rem; }
    .contact-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #25D366;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(37,211,102,0.3);
    }
    .contact-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(37,211,102,0.4); }

    footer {
      text-align: center;
      padding: 3rem 5%;
      opacity: 0.5;
      font-size: 0.85rem;
      border-top: 1px solid rgba(0,0,0,0.06);
    }

    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .cart-overlay.open { opacity: 1; pointer-events: auto; }
    .cart-drawer {
      position: fixed;
      top: 0;
      right: -400px;
      width: 380px;
      max-width: 90vw;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 20px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 2001;
      padding: 2rem;
      overflow-y: auto;
    }
    .cart-drawer.open { right: 0; }
    .cart-drawer h2 {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-weight: 500; }
    .cart-item-price { color: var(--primary); font-weight: 600; }
    .cart-item-quantity { display: flex; align-items: center; gap: 0.75rem; }
    .cart-item-quantity button {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .cart-item-quantity button:hover { background: #f5f5f5; }
    .cart-total {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0,0,0,0.06);
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
    }
    .checkout-btn {
      width: 100%;
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .checkout-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    @media (max-width: 768px) {
      header { padding: 0.85rem 5%; }
      nav { gap: 1.25rem; }
      nav a { font-size: 0.85rem; }
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .product-card { padding: 1rem; }
    }
    @media (max-width: 480px) {
      .product-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">${input.business_name}</div>
    <nav>
      <a href="#products">Products</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="cart-icon">
      <span>🛒</span>
      <span class="cart-badge" id="cart-badge">0</span>
    </div>
  </header>

  <section id="hero">
    <h1>${content.hero_headline}</h1>
    ${content.hero_subheadline ? `<p>${content.hero_subheadline}</p>` : ''}
    <button class="btn-primary">${content.hero_cta}</button>
  </section>

  <section id="products">
    <h2>${content.products_section_title || 'Our Products'}</h2>
    <div class="product-grid">
      ${productCards}
    </div>
  </section>

  <section id="about">
    <h2>${content.about_title}</h2>
    <p>${content.about_body}</p>
  </section>

  <section id="contact">
    <h2>Get in Touch</h2>
    <p>${content.contact_tagline || 'We would love to hear from you!'}</p>
    <a href="https://wa.me/91xxxxxxxxxx?text=${encodeURIComponent(
      content.whatsapp_message
    )}" class="contact-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      Message us on WhatsApp
    </a>
  </section>

  <footer>
    <p>${content.footer_tagline || 'Powered by Nudge Commerce AI'}</p>
  </footer>

  <div class="cart-overlay" id="cart-overlay"></div>
  <div class="cart-drawer" id="cart-drawer">
    <h2>Your Cart</h2>
    <div id="cart-items"></div>
    <div class="cart-total">
      <span>Total</span>
      <span>₹<span id="cart-total">0</span></span>
    </div>
    <button class="checkout-btn" onclick="initiateCheckout()">Checkout</button>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('nudge_cart') || '[]');

    function updateCartBadge() {
      document.getElementById('cart-badge').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function renderCart() {
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');

      if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
      }

      cartItems.innerHTML = cart.map((item, index) => \`
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">\${item.name}</span>
            <span class="cart-item-price">₹\${item.price}</span>
          </div>
          <div class="cart-item-quantity">
            <button onclick="changeQuantity(\${index}, -1)">-</button>
            <span>\${item.quantity}</span>
            <button onclick="changeQuantity(\${index}, 1)">+</button>
            <button onclick="removeItem(\${index})" style="background: #ffebee; color: #c62828; border: none;">×</button>
          </div>
        </div>
      \`).join('');

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotal.textContent = total.toFixed(2);
    }

    function changeQuantity(index, delta) {
      if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + delta);
        if (cart[index].quantity === 0) {
          cart.splice(index, 1);
        }
        saveCart();
      }
    }

    function removeItem(index) {
      cart.splice(index, 1);
      saveCart();
    }

    function saveCart() {
      localStorage.setItem('nudge_cart', JSON.stringify(cart));
      updateCartBadge();
      renderCart();
    }

    document.addEventListener('DOMContentLoaded', () => {
      // Add to cart buttons
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
          const name = button.getAttribute('data-name');
          const price = parseFloat(button.getAttribute('data-price'));
          const existingItem = cart.find(item => item.name === name);

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push({ name, price, quantity: 1 });
          }
          saveCart();
        });
      });

      // Cart toggle
      document.querySelector('.cart-icon').addEventListener('click', () => {
        document.getElementById('cart-drawer').classList.toggle('open');
      });

      // Close cart when clicking outside
      document.getElementById('cart-drawer').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          e.currentTarget.classList.remove('open');
        }
      });

      updateCartBadge();
      renderCart();
    });

    // Razorpay checkout
    function initiateCheckout() {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paisa
          currency: 'INR',
          items: cart.map(item => ({
            name: item.name,
            amount: Math.round(item.price * 100),
            quantity: item.quantity
          }))
        })
      })
      .then(res => res.json())
      .then(data => {
        var options = {
          key: "rzp_test_123", // Replace with actual key in production
          amount: data.amount,
          currency: data.currency,
          name: "\${input.business_name}",
          description: "Purchase from Nudge store",
          image: "https://nudge.store/logo.png",
          handler: function (response){
            alert("Payment successful! Payment ID: \${response.razorpay_payment_id}");
            // Clear cart after successful payment
            cart = [];
            saveCart();
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          theme: {
            color: "\${design.primary_color.replace('#', '')}"
          }
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();
      })
      .catch(err => {
        console.error('Checkout error:', err);
        alert('Payment processing failed. Please try again.');
      });
    }
  </script>
</body>
</html>`;
}