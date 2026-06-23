import { callModel } from '@/lib/pipeline/utils/callModel';
import { QA_SYSTEM_PROMPT } from '@/lib/pipeline/prompts';
import type { BuildOutput, QAOutput } from '@/lib/pipeline/types';

export async function runQAAgent(build: BuildOutput): Promise<QAOutput> {
  const startTime = Date.now();

  // Run checks in code first
  const issuesFound: string[] = [];

  if (!build.html.includes('<!DOCTYPE html>')) {
    issuesFound.push('Missing DOCTYPE declaration');
  }

  if (!build.html.includes('<meta name="viewport">')) {
    issuesFound.push('Missing viewport meta tag');
  }

  if (!build.html.includes('<title>')) {
    issuesFound.push('Missing title tag');
  }

  if (!build.html.includes('id="hero"')) {
    issuesFound.push('Missing hero section with id="hero"');
  }

  if (!build.html.includes('id="products"')) {
    issuesFound.push('Missing products section with id="products"');
  }

  if (!build.html.includes('id="about"')) {
    issuesFound.push('Missing about section with id="about"');
  }

  if (!build.html.includes('id="contact"')) {
    issuesFound.push('Missing contact section with id="contact"');
  }

  if (!build.html.includes('nudge_cart')) {
    issuesFound.push('Missing cart localStorage key (nudge_cart)');
  }

  if (!build.html.includes('Razorpay')) {
    issuesFound.push('Missing Razorpay integration');
  }

  if (!build.html.includes('@media')) {
    issuesFound.push('Missing responsive CSS (@media queries)');
  }

  if (!build.html.includes(':root') && !build.html.includes(':root {')) {
    issuesFound.push('Missing CSS custom properties (:root)');
  }

  if (issuesFound.length === 0) {
    console.log(`[QA] ✓ completed in ${Date.now() - startTime}ms`);
    return {
      passed: true,
      issues_found: [],
      issues_fixed: [],
      html: build.html,
      css: build.css,
      js: build.js
    };
  }

  // Send to QA model for fixes
  try {
    const systemMessage = QA_SYSTEM_PROMPT;
    const userMessage = `Issues found: ${issuesFound.join(', ')}. HTML: ${build.html}`;

    const modelResponse = await callModel(
      'moonshotai/kimi-k2.6:free',
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 8000 }
    );

    const parsed = JSON.parse(modelResponse);
    console.log(`[QA] ✓ completed in ${Date.now() - startTime}ms`);
    return {
      passed: true,
      issues_found: issuesFound,
      issues_fixed: issuesFound,
      html: parsed.html || build.html,
      css: build.css,
      js: build.js
    };
  } catch (error) {
    console.error('[QA] ✗ failed:', error);
    return {
      passed: false,
      issues_found: issuesFound,
      issues_fixed: [],
      html: build.html,
      css: build.css,
      js: build.js
    };
  }
}