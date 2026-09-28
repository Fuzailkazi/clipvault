import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string;
  description: string;
  ogImage: string;
  contentSnippet: string;
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClipVaultBot/1.0; +https://clipvault.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackData(targetUrl);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      targetUrl;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Extract clean body text (first ~1500 chars)
    $('script, style, noscript, nav, footer, header').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const contentSnippet = (description + ' ' + bodyText).slice(0, 1500);

    return {
      title,
      description,
      ogImage,
      contentSnippet,
    };
  } catch (error) {
    return fallbackData(targetUrl);
  }
}

function fallbackData(targetUrl: string): ScrapedData {
  try {
    const urlObj = new URL(targetUrl);
    return {
      title: urlObj.hostname,
      description: '',
      ogImage: '',
      contentSnippet: `Page at ${targetUrl}`,
    };
  } catch {
    return {
      title: targetUrl,
      description: '',
      ogImage: '',
      contentSnippet: targetUrl,
    };
  }
}
