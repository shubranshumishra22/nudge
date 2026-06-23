export const HeaderV1_CSS = `
.header-v1 {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  padding: 1.2rem 5%;
  transition: all 0.3s ease;
}

.header-v1-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-v1 .logo {
  font-family: var(--font-heading), serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.header-v1 .nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.header-v1 .nav-links a {
  color: var(--text);
  opacity: 0.7;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
  position: relative;
}

.header-v1 .nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}

.header-v1 .nav-links a:hover {
  opacity: 1;
}

.header-v1 .nav-links a:hover::after {
  width: 100%;
}

.header-v1 .cart-icon {
  position: relative;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.header-v1 .cart-icon:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-v1 .cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
`;

export const HeroV1_CSS = `
.hero-v1 {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8rem 5% 6rem;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-v1::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(var(--primary-rgb), 0.12), transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(var(--accent-rgb), 0.12), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.hero-v1-content {
  position: relative;
  z-index: 1;
  max-width: 850px;
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4rem 3rem;
  border-radius: 28px;
  box-shadow: var(--shadow-lg);
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-v1 h1 {
  font-family: var(--font-heading), serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
  margin-bottom: 1.8rem;
  color: var(--text);
}

.hero-v1 p {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  opacity: 0.75;
  max-width: 650px;
  margin: 0 auto 3rem;
  line-height: 1.65;
  letter-spacing: -0.01em;
}

.hero-v1 .btn-primary {
  display: inline-flex;
  align-items: center;
  background: var(--primary);
  color: white;
  border: none;
  padding: 1.1rem 2.8rem;
  border-radius: var(--radius);
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.3);
  letter-spacing: -0.01em;
}

.hero-v1 .btn-primary:hover {
  transform: translateY(-3px);
  opacity: 0.95;
  box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.5);
}
`;

export const HeroV2_CSS = `
.hero-v2 {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  padding: 6rem 5%;
  overflow: hidden;
  position: relative;
  background: radial-gradient(circle at 10% 20%, rgba(var(--primary-rgb), 0.08), transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(var(--accent-rgb), 0.08), transparent 40%);
}

.hero-v2-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .hero-v2-grid {
    grid-template-columns: 1.1fr 1fr;
  }
}

.hero-v2-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-v2-text h1 {
  font-family: var(--font-heading), serif;
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
  margin-bottom: 1.8rem;
  color: var(--text);
}

.hero-v2-text p {
  font-size: clamp(1.1rem, 1.8vw, 1.25rem);
  opacity: 0.75;
  max-width: 550px;
  margin-bottom: 3rem;
  line-height: 1.65;
}

.hero-v2-text .btn-primary {
  display: inline-flex;
  align-items: center;
  background: var(--primary);
  color: white;
  border: none;
  padding: 1.1rem 2.8rem;
  border-radius: var(--radius);
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.3);
  letter-spacing: -0.01em;
}

.hero-v2-text .btn-primary:hover {
  transform: translateY(-3px);
  opacity: 0.95;
  box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.5);
}

.hero-v2-image-container {
  width: 100%;
  aspect-ratio: 1.1/1;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  animation: heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-v2-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-v2-image-container:hover .hero-v2-image {
  transform: scale(1.05);
}
`;

export const ProductsV1_CSS = `
.products-v1 {
  padding: 8rem 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.products-v1 h2 {
  font-family: var(--font-heading), serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center;
  margin-bottom: 4rem;
  letter-spacing: -0.03em;
  font-weight: 700;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
}

.product-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.card-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.card-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--primary-rgb), 0.1);
}

.card-border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.card-border:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(var(--primary-rgb), 0.08);
}

.card-flat {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid transparent;
}

.card-flat:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
}

.product-image {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 18px;
  margin-bottom: 1.5rem;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

.product-name {
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  color: var(--text);
}

.product-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.add-to-cart {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.15);
}

.add-to-cart:hover {
  opacity: 0.95;
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.3);
}
`;

export const AboutV1_CSS = `
.about-v1 {
  padding: 8rem 5%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.02) 0%, transparent 100%);
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.02);
}

.about-v1 h2 {
  font-family: var(--font-heading), serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 2rem;
  letter-spacing: -0.03em;
  font-weight: 700;
}

.about-v1 p {
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.8;
  font-size: 1.2rem;
  line-height: 1.85;
  letter-spacing: -0.01em;
}
`;

export const ContactV1_CSS = `
.contact-v1 {
  padding: 8rem 5%;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.contact-v1 h2 {
  font-family: var(--font-heading), serif;
  font-size: clamp(2rem, 3.5vw, 2.6rem);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.contact-v1 p {
  opacity: 0.75;
  font-size: 1.15rem;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white;
  padding: 1.1rem 2.8rem;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.contact-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5);
}
`;

export const FooterV1_CSS = `
.footer-v1 {
  text-align: center;
  padding: 4rem 5%;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0,0,0,0.06);
}

.footer-v1-content h3 {
  font-family: var(--font-heading), serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.footer-v1 .footer-tagline {
  opacity: 0.6;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.footer-v1 .footer-copyright {
  opacity: 0.4;
  font-size: 0.8rem;
}
`;
