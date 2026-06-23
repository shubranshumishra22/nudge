import React from 'react';
import { componentRegistry } from '../components/registry';
import type { LayoutPlan } from '../types';

// Use require instead of static import to bypass Next.js static bundler checks for react-dom/server inside client-visible paths
const ReactDOMServer = require('react-dom/server');

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return isNaN(r) || isNaN(g) || isNaN(b) ? '0, 0, 0' : `${r}, ${g}, ${b}`;
}

/**
 * Compiles a V2 LayoutPlan containing modular components and styles into a standalone HTML + CSS page.
 * Uses React.createElement instead of JSX syntax to reside in a pure .ts file, bypassing SWC component restrictions.
 */
export function renderLayoutToHTML(layout: LayoutPlan): { html: string; css: string } {
  let cssContent = '';

  const footerComp = layout.components.find(c => c.name === 'FooterV1');
  const businessName = footerComp?.props?.businessName || 'Nudge Merchant';

  const componentsTree = React.createElement(
    'div',
    {
      style: {
        backgroundColor: layout.style.background_color,
        color: layout.style.text_color,
        fontFamily: layout.style.font_body,
        minHeight: '100vh',
      }
    },
    layout.components.map((comp, idx) => {
      const entry = componentRegistry[comp.name];
      if (!entry) {
        console.warn(`Component "${comp.name}" not found in registry.`);
        return null;
      }

      const Component = entry.component;

      // Append CSS styles directly from component registry entry
      if (entry.css) {
        cssContent += entry.css + '\n';
      }

      // Instantiate using React.createElement
      return React.createElement(Component, {
        key: idx,
        ...comp.props,
        styleTokens: layout.style
      });
    })
  );

  const bodyMarkup = ReactDOMServer.renderToStaticMarkup(componentsTree);

  const primaryRgb = hexToRgb(layout.style.primary_color);
  const accentRgb = hexToRgb(layout.style.accent_color);
  const textRgb = hexToRgb(layout.style.text_color || '#1A1A1A');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Online Store</title>
  <link href="https://fonts.googleapis.com/css2?family=${layout.style.font_heading.replace(/ /g, '+')}:wght@400;700;800&family=${layout.style.font_body.replace(/ /g, '+')}:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${layout.style.primary_color};
      --primary-rgb: ${primaryRgb};
      --accent: ${layout.style.accent_color};
      --accent-rgb: ${accentRgb};
      --bg: ${layout.style.background_color};
      --text: ${layout.style.text_color};
      --text-rgb: ${textRgb};
      --radius: ${layout.style.border_radius};
      --space: ${layout.style.spacing_unit};
      
      --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
      --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
      --shadow-lg: 0 16px 40px rgba(0,0,0,0.12);
      --glass-bg: rgba(255, 255, 255, 0.75);
      --glass-border: rgba(255, 255, 255, 0.4);
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font-body), sans-serif;
      background-color: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }
    
    button, a {
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
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
      box-shadow: -10px 0 30px rgba(0,0,0,0.15);
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2001;
      padding: 2.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .cart-drawer.open { right: 0; }
    
    .cart-drawer h2 {
      font-family: var(--font-heading), serif;
      font-size: 1.6rem;
      margin-bottom: 2rem;
      font-weight: 700;
      color: #1A1A1A;
    }
    
    #cart-items {
      flex: 1;
      overflow-y: auto;
    }
    
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    
    .cart-item-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #1a1a1a;
    }
    
    .cart-item-price {
      color: var(--primary);
      font-weight: 700;
      font-size: 1rem;
    }
    
    .cart-item-quantity {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .cart-item-quantity button {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cart-item-quantity button:hover {
      background: #f5f5f5;
    }
    
    .cart-total {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(0,0,0,0.06);
      font-size: 1.3rem;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      color: #1a1a1a;
    }
    
    .checkout-btn {
      width: 100%;
      margin-top: 1.5rem;
      padding: 1.1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 14px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
    }
    
    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.35);
    }
    
    ${cssContent}
  </style>
</head>
<body>
  ${bodyMarkup}

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
    let cart = JSON.parse(localStorage.getItem('nudge_cart') || '[]');

    function updateCartBadge() {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      const badge = document.getElementById('cart-badge');
      if (badge) {
        badge.textContent = count;
        badge.classList.remove('bounce');
        void badge.offsetWidth;
        badge.classList.add('bounce');
      }
    }

    function renderCart() {
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');

      if (!cartItems || !cartTotal) return;

      if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: #666; font-size: 0.95rem; text-align: center; margin-top: 2rem;">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
      }

      cartItems.innerHTML = cart.map((item, index) => \`
        <div class="cart-item">
          <div class="cart-item-info" style="flex: 1;">
            <div class="cart-item-name">\${item.name}</div>
            <div class="cart-item-price">₹\${item.price}</div>
          </div>
          <div class="cart-item-quantity">
            <button onclick="changeQuantity(\${index}, -1)">-</button>
            <span style="font-weight: 600; width: 12px; text-align: center;">\${item.quantity}</span>
            <button onclick="changeQuantity(\${index}, 1)">+</button>
            <button onclick="removeItem(\${index})" style="background: #ffebee; color: #c62828; border: none; font-size: 1.1rem; padding: 0 8px; margin-left: 8px;">×</button>
          </div>
        </div>
      \`).join('');

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotal.textContent = total.toLocaleString('en-IN');
    }

    function changeQuantity(index, delta) {
      if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + delta);
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
      document.body.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-cart');
        if (button) {
          const name = button.getAttribute('data-name');
          const price = parseFloat(button.getAttribute('data-price'));
          const existingItem = cart.find(item => item.name === name);

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push({ name, price, quantity: 1 });
          }
          saveCart();
          
          const drawer = document.getElementById('cart-drawer');
          const overlay = document.getElementById('cart-overlay');
          if (drawer && overlay) {
            drawer.classList.add('open');
            overlay.classList.add('open');
          }
        }
      });

      const cartIcon = document.querySelector('.cart-icon');
      const cartDrawer = document.getElementById('cart-drawer');
      const cartOverlay = document.getElementById('cart-overlay');

      if (cartIcon && cartDrawer && cartOverlay) {
        cartIcon.addEventListener('click', () => {
          cartDrawer.classList.toggle('open');
          cartOverlay.classList.toggle('open');
        });

        cartOverlay.addEventListener('click', () => {
          cartDrawer.classList.remove('open');
          cartOverlay.classList.remove('open');
        });
      }

      updateCartBadge();
      renderCart();
    });

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
          amount: Math.round(total * 100),
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
          key: "rzp_test_123",
          amount: data.amount,
          currency: data.currency,
          name: "${businessName}",
          description: "Store Purchase",
          image: "https://nudge.store/logo.png",
          handler: function (response){
            alert("Payment successful! ID: " + response.razorpay_payment_id);
            cart = [];
            saveCart();
            document.getElementById('cart-drawer').classList.remove('open');
            document.getElementById('cart-overlay').classList.remove('open');
          },
          theme: {
            color: "${layout.style.primary_color}"
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

  return { html, css: cssContent };
}
