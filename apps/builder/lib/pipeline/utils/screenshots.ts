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

export async function takeScreenshot(url: string): Promise<string> {
  let browser = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const base64 = await page.screenshot({ encoding: 'base64' });
    return base64;
  } catch (error) {
    console.error(`Failed to take screenshot of ${url}:`, error);
    return '';
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
