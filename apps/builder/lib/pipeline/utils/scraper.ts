import puppeteer from 'puppeteer-core';
import Chromium from '@sparticuz/chromium';

async function launchBrowser() {
  const executablePath = await Chromium.executablePath();
  return puppeteer.launch({
    args: [...(await puppeteer.defaultArgs()), '--no-sandbox', '--disable-setuid-sandbox'],
    executablePath,
    headless: true,
    timeout: 30000,
  });
}

export async function scrapeWebsite(url: string): Promise<string> {
  if (process.platform === 'darwin') {
    console.warn('[Puppeteer] Skipping website scraping on macOS to avoid @sparticuz/chromium executable errors.');
    return '';
  }
  let browser = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

    const title = await page.title();
    const headings = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3');
      return Array.from(elements).map(el => el.textContent?.trim() || '');
    });
    const buttons = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, .btn, [role="button"]');
      return Array.from(elements).map(el => el.textContent?.trim() || '');
    });
    const navLinks = await page.evaluate(() => {
      const elements = document.querySelectorAll('nav a, .nav a, header a');
      return Array.from(elements).map(el => el.textContent?.trim() || '');
    });
    const metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta?.getAttribute('content') || '';
    });
    const bodyText = await page.evaluate(() => {
      const body = document.body;
      if (!body) return '';
      const text = body.textContent || '';
      return text.substring(0, 500);
    });

    const summary = [
      `Title: ${title}`,
      `Headings: ${headings.join(', ')}`,
      `Buttons: ${buttons.join(', ')}`,
      `Navigation: ${navLinks.join(', ')}`,
      `Meta Description: ${metaDescription}`,
      `Body Preview: ${bodyText}`,
    ].join('\n').substring(0, 800);

    return summary;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return '';
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
