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

    const userMessage = `DESIGN TOKENS: ${JSON.stringify(design)}
CONTENT: ${JSON.stringify(content)}
PRODUCTS: ${JSON.stringify(formattedProducts)}
STORE NAME: ${input.business_name}
BUSINESS TYPE: ${input.business_type}
PRIMARY COLOR: ${input.primary_color}

Generate the complete HTML file as described in the system prompt.`;

    const modelResponse = await callModel(
      'poolside/laguna-xs.2:free',
      [
        { role: 'system', content: BUILDER_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 8000, temperature: 0.2 }
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
  )}:wght@400;700&family=${design.font_body.replace(
    / /g,
    '+'
  )}:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${design.primary_color};
      --accent-color: ${design.accent_color};
      --background-color: ${design.background_color};
      --text-color: ${design.text_color};
      --font-heading: '${design.font_heading}', serif;
      --font-body: '${design.font_body}', sans-serif;
      --border-radius: ${design.border_radius};
      --spacing-unit: ${design.spacing_unit};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font-body);
      color: var(--text-color);
      background-color: var(--background-color);
      line-height: 1.6;
      opacity: 0;
      animation: fadeIn 0.4s forwards;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    header {
      position: sticky;
      top: 0;
      background: var(--primary-color);
      color: white;
      padding: 1rem var(--spacing-unit);
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-family: var(--font-heading); font-size: 1.5rem; }
    nav { display: flex; gap: 1.5rem; }
    nav a { color: white; text-decoration: none; font-weight: 500; }
    nav a:hover { opacity: 0.8; }
    .cart-icon { position: relative; }
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--accent-color);
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.75rem;
    }
    #hero {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0 var(--spacing-unit);
    }
    #hero h1 {
      font-family: var(--font-heading);
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    #hero p { font-size: 1.25rem; margin-bottom: 2rem; }
    .btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius);
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    #products {
      padding: 4rem var(--spacing-unit);
    }
    #products h2 {
      font-family: var(--font-heading);
      text-align: center;
      margin-bottom: 2rem;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-unit);
    }
    .product-card {
      border: 1px solid #eee;
      border-radius: var(--border-radius);
      overflow: hidden;
      text-align: center;
      padding: 1.5rem;
    }
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: calc(var(--border-radius) / 2);
      margin-bottom: 1rem;
    }
    .product-name { font-weight: 600; margin-bottom: 0.5rem; }
    .product-description { color: #666; margin-bottom: 1rem; font-size: 0.9rem; }
    .product-price {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }
    .add-to-cart {
      width: 100%;
      padding: 0.75rem;
    }
    #about {
      background: #f8f9fa;
      padding: 4rem var(--spacing-unit);
      text-align: center;
    }
    #about h2 {
      font-family: var(--font-heading);
      margin-bottom: 1.5rem;
    }
    #contact {
      padding: 3rem var(--spacing-unit);
      text-align: center;
    }
    .contact-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary-color);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius);
      text-decoration: none;
    }
    footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.9rem;
      border-top: 1px solid #eee;
    }
    /* Cart Drawer */
    .cart-drawer {
      position: fixed;
      top: 0;
      right: -350px;
      width: 300px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1000;
      padding: 2rem;
      overflow-y: auto;
    }
    .cart-drawer.open { right: 0; }
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-weight: 500; }
    .cart-item-price { color: var(--primary-color); }
    .cart-item-quantity { display: flex; align-items: center; gap: 0.5rem; }
    .cart-item-quantity button {
      width: 25px;
      height: 25px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
    }
    .cart-total {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      font-size: 1.25rem;
      font-weight: bold;
    }
    .checkout-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--accent-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
    }
    /* Responsive */
    @media (min-width: 768px) {
      #hero h1 { font-size: 3.5rem; }
    }
    @media (min-width: 1024px) {
      #hero h1 { font-size: 4rem; }
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
    <button class="btn">${content.hero_cta}</button>
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
      Message us on WhatsApp
    </a>
  </section>

  <footer>
    <p>${content.footer_tagline || 'Powered by Nudge Commerce AI'}</p>
  </footer>

  <div class="cart-drawer" id="cart-drawer">
    <h2>Your Cart</h2>
    <div id="cart-items"></div>
    <div class="cart-total">Total: ₹<span id="cart-total">0</span></div>
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