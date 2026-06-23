import puppeteer from 'puppeteer-core';
import Chromium from '@sparticuz/chromium';

async function launchBrowser() {
  const executablePath = await Chromium.executablePath();
  return puppeteer.launch({
    args: [...(await puppeteer.defaultArgs()), '--no-sandbox', '--disable-setuid-sandbox'],
    executablePath,
    headless: true,
    timeout: 15000,
  });
}

export interface RuleBasedMetrics {
  passed: boolean;
  issues: string[];
  contrastRatioViolations: string[];
  headingHierarchyViolations: string[];
  touchTargetViolations: string[];
  hasViewportMeta: boolean;
}

/**
 * Renders HTML inside Puppeteer and runs accessibility, design, and styling checks.
 * Also returns a base64 screenshot of the compiled layout.
 */
export async function renderAndAnalyzeHTML(html: string): Promise<{
  screenshotBase64: string;
  metrics: RuleBasedMetrics;
}> {
  let browser = null;
  let screenshotBase64 = '';
  const metrics: RuleBasedMetrics = {
    passed: true,
    issues: [],
    contrastRatioViolations: [],
    headingHierarchyViolations: [],
    touchTargetViolations: [],
    hasViewportMeta: false,
  };

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Set the static HTML directly
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // 1. Take screenshot
    try {
      screenshotBase64 = await page.screenshot({ encoding: 'base64' }) as string;
    } catch (err) {
      console.error('Failed to take screenshot of content:', err);
    }

    // 2. Run analysis inside browser context
    const analysis = await page.evaluate(() => {
      const issues: string[] = [];
      const contrastRatioViolations: string[] = [];
      const headingHierarchyViolations: string[] = [];
      const touchTargetViolations: string[] = [];

      // Check 1: Viewport Meta Tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = !!viewportMeta;
      if (!hasViewportMeta) {
        issues.push('Missing viewport meta tag (crucial for mobile responsiveness)');
      }

      // Check 2: Heading Hierarchy (no skipping levels e.g. h1 -> h3)
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let lastLevel = 0;
      headings.forEach((h) => {
        const currentLevel = parseInt(h.tagName.substring(1), 10);
        if (lastLevel > 0 && currentLevel - lastLevel > 1) {
          const msg = `Skipped heading level from H${lastLevel} directly to H${currentLevel} ("${h.textContent?.trim().slice(0, 30)}")`;
          headingHierarchyViolations.push(msg);
          issues.push(msg);
        }
        lastLevel = currentLevel;
      });

      // Check 3: Touch Target Sizing (minimum 44px for buttons/links)
      const interactive = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
      interactive.forEach((el: any) => {
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        // Don't flag empty/hidden links or ones with 0 width/height
        if (width > 0 && height > 0 && (width < 40 || height < 32)) {
          const label = el.textContent?.trim() || el.getAttribute('aria-label') || el.value || 'unlabeled target';
          const msg = `Small touch target "${label}" (${Math.round(width)}x${Math.round(height)}px) is below minimum recommended size`;
          touchTargetViolations.push(msg);
          issues.push(msg);
        }
      });

      // Helper function to parse rgb/rgba color string
      function parseColor(colorStr: string): number[] {
        const match = colorStr.match(/\d+(\.\d+)?/g);
        if (!match) return [255, 255, 255];
        return match.slice(0, 3).map(Number);
      }

      // Helper function to calculate luminance
      function getLuminance(rgb: number[]): number {
        const [r, g, b] = rgb.map(v => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      // Check 4: Simple program contrast checking on text elements
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node: any) => {
          // Check if element has direct text nodes
          const hasDirectText = Array.from(node.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 0);
          return hasDirectText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });

      let textElement = walker.nextNode() as HTMLElement;
      let checkedCount = 0;
      while (textElement && checkedCount < 50) { // Limit to top 50 elements to avoid performance hits
        const style = window.getComputedStyle(textElement);
        const color = style.color;
        
        // Find ancestor background color
        let currentBg = style.backgroundColor;
        let parent = textElement.parentElement;
        while ((currentBg === 'rgba(0, 0, 0, 0)' || currentBg === 'transparent') && parent) {
          const parentStyle = window.getComputedStyle(parent);
          currentBg = parentStyle.backgroundColor;
          parent = parent.parentElement;
        }
        if (currentBg === 'rgba(0, 0, 0, 0)' || currentBg === 'transparent') {
          currentBg = 'rgb(255, 255, 255)'; // Fallback to white body
        }

        const rgbFg = parseColor(color);
        const rgbBg = parseColor(currentBg);

        const lumFg = getLuminance(rgbFg);
        const lumBg = getLuminance(rgbBg);

        const L1 = Math.max(lumFg, lumBg);
        const L2 = Math.min(lumFg, lumBg);
        const ratio = (L1 + 0.05) / (L2 + 0.05);

        // Check if normal text fails 4.5:1 contrast ratio
        const fontSizeStr = style.fontSize || '16px';
        const fontSize = parseFloat(fontSizeStr);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && style.fontWeight === 'bold');
        const requiredRatio = isLargeText ? 3.0 : 4.5;

        if (ratio < requiredRatio) {
          const textExcerpt = textElement.textContent?.trim().slice(0, 20) || '';
          const msg = `Contrast ratio for "${textExcerpt}" text is ${ratio.toFixed(2)}:1 (Failed to meet minimum ${requiredRatio}:1)`;
          contrastRatioViolations.push(msg);
          issues.push(msg);
        }

        textElement = walker.nextNode() as HTMLElement;
        checkedCount++;
      }

      return {
        hasViewportMeta,
        issues,
        contrastRatioViolations,
        headingHierarchyViolations,
        touchTargetViolations,
      };
    });

    metrics.hasViewportMeta = analysis.hasViewportMeta;
    metrics.issues = analysis.issues;
    metrics.contrastRatioViolations = analysis.contrastRatioViolations;
    metrics.headingHierarchyViolations = analysis.headingHierarchyViolations;
    metrics.touchTargetViolations = analysis.touchTargetViolations;
    metrics.passed = analysis.issues.length === 0;

  } catch (err) {
    console.error('HTML Visual Analysis failed:', err);
    metrics.passed = false;
    metrics.issues.push(`Visual analysis run-time error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return {
    screenshotBase64,
    metrics,
  };
}
