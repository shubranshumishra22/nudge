import { UserInput, QAOutput } from '../types';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function scoreOutput(
  html: string,
  qaResult: QAOutput,
  input: UserInput
): Promise<number> {
  let score = 0;
  const htmlLower = html.toLowerCase();

  // --------------------------------------------------
  // A. QA checks (40 pts)
  // --------------------------------------------------
  if (html.includes('<!DOCTYPE html>')) score += 4;
  if (html.includes('<meta name="viewport">')) score += 4;
  if (html.includes('<title>')) score += 4;
  if (html.includes('id="hero"')) score += 4;
  if (html.includes('id="products"')) score += 4;
  if (html.includes('id="about"')) score += 4;
  if (html.includes('id="contact"')) score += 4;
  if (html.includes('nudge_cart')) score += 4;
  if (html.includes('@media')) score += 4;
  if (html.includes(':root') && (html.includes(':root {') || html.includes(':root{'))) score += 4;

  // --------------------------------------------------
  // B. Content completeness (30 pts)
  // --------------------------------------------------
  // 1. Products mentioned (+3 per product found, max 15)
  if (input.products && Array.isArray(input.products)) {
    let productsFound = 0;
    for (const prod of input.products) {
      if (html.includes(prod.name)) {
        productsFound++;
      }
    }
    score += Math.min(productsFound * 3, 15);
  }

  // 2. Store name appears >= 3 times (+5)
  if (input.business_name) {
    const escapedName = escapeRegExp(input.business_name);
    const regex = new RegExp(escapedName, 'gi');
    const matches = html.match(regex);
    if (matches && matches.length >= 3) {
      score += 5;
    }
  }

  // 3. Has WhatsApp or contact section text (+5)
  if (htmlLower.includes('wa.me') || htmlLower.includes('whatsapp')) {
    score += 5;
  }

  // 4. Has price formatted with ₹ (+5)
  if (html.includes('₹')) {
    score += 5;
  }

  // --------------------------------------------------
  // C. Design quality heuristics (30 pts)
  // --------------------------------------------------
  // 1. CSS variables present (+8)
  if (html.includes('--color') || html.includes('--bg')) {
    score += 8;
  }

  // 2. Google Fonts link tag present (+6)
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) {
    score += 6;
  }

  // 3. Has transition or animation CSS (+4)
  if (
    htmlLower.includes('transition:') ||
    htmlLower.includes('animation:') ||
    htmlLower.includes('transition-duration') ||
    htmlLower.includes('@keyframes')
  ) {
    score += 4;
  }

  // 4. Has :hover styles (+4)
  if (html.includes(':hover')) {
    score += 4;
  }

  // 5. Has media queries for min-width: 768 (+4)
  if (htmlLower.includes('768px') || htmlLower.includes('768')) {
    score += 4;
  }

  // 6. HTML > 8000 chars (+4)
  if (html.length > 8000) {
    score += 4;
  }

  return Math.min(score, 100);
}
