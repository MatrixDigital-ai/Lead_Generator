import { WebsiteHealth } from '@/types';

const BUSINESS_KEYWORDS = [
  'services',
  'solutions',
  'products',
  'enterprise',
  'business',
  'professional',
  'consulting',
  'agency',
  'company',
  'corporation',
  'industries',
  'manufacturing',
  'technology',
  'software',
  'digital',
  'marketing',
  'management',
  'logistics',
  'wholesale',
  'distribution',
  'b2b',
  'commercial',
  'corporate',
  'partner',
  'vendor',
  'supplier',
  'contractor',
  'developer',
  'provider',
];

export async function checkWebsiteHealth(domain: string): Promise<WebsiteHealth> {
  const httpsUrl = `https://${domain}`;
  const httpUrl = `http://${domain}`;
  
  let status: 'live' | 'down' | 'unknown' = 'unknown';
  let responseTime: number | null = null;
  let isHttps = false;
  let hasBusinessKeywords = false;
  let html = '';

  // Try HTTPS first
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(httpsUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    responseTime = Date.now() - startTime;

    if (response.ok) {
      status = 'live';
      isHttps = true;
      html = await response.text();
    }
  } catch {
    // HTTPS failed, try HTTP
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(httpUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      responseTime = Date.now() - startTime;

      if (response.ok) {
        status = 'live';
        html = await response.text();
      } else {
        status = 'down';
      }
    } catch {
      status = 'down';
    }
  }

  // Check for business keywords in HTML
  if (html) {
    const lowerHtml = html.toLowerCase();
    hasBusinessKeywords = BUSINESS_KEYWORDS.some(keyword => lowerHtml.includes(keyword));
  }

  return {
    status,
    responseTime,
    isHttps,
    hasBusinessKeywords,
  };
}

export async function batchCheckHealth(
  domains: string[],
  concurrency: number = 3
): Promise<Map<string, WebsiteHealth>> {
  const results = new Map<string, WebsiteHealth>();
  
  // Process in batches to avoid overwhelming servers
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const promises = batch.map(async domain => {
      const health = await checkWebsiteHealth(domain);
      results.set(domain, health);
    });
    await Promise.all(promises);
  }
  
  return results;
}
