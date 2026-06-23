import { renderLayoutToHTML } from './utils/renderer';
import { renderAndAnalyzeHTML } from './utils/metrics';
import type { LayoutPlan } from './types';

async function test() {
  const layout: LayoutPlan = {
    style: {
      primary_color: '#4F46E5',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_heading: 'Playfair Display',
      font_body: 'Inter',
      border_radius: '12px',
      spacing_unit: '24px',
      hero_style: 'fullbleed',
      card_style: 'shadow',
      template_name: 'warm-minimal',
    },
    components: [
      {
        name: 'HeaderV1',
        props: {
          businessName: 'Test Business',
        },
      },
      {
        name: 'HeroV1',
        props: {
          headline: 'Test Headline',
          subheadline: 'Test Subheadline',
          ctaText: 'Test CTA',
        },
      },
      {
        name: 'ProductsV1',
        props: {
          title: 'Test Products',
          products: [
            { name: 'Product A', price: 999, description: 'Description A' },
            { name: 'Product B', price: 1499, description: 'Description B' },
          ],
        },
      },
      {
        name: 'FooterV1',
        props: {
          tagline: 'Test Footer Tagline',
          businessName: 'Test Business',
        },
      },
    ],
  };

  console.log('Rendering layout to HTML...');
  const { html, css } = renderLayoutToHTML(layout);
  console.log('HTML and CSS generated successfully.');
  console.log('HTML Length:', html.length);
  console.log('CSS Length:', css.length);

  console.log('Running visual metrics evaluation...');
  try {
    const analysis = await renderAndAnalyzeHTML(html);
    console.log('Puppeteer Visual Metrics Result:', JSON.stringify(analysis.metrics, null, 2));
  } catch (err) {
    console.error('Puppeteer Visual Metrics failed:', err);
  }
}

test().catch(console.error);
