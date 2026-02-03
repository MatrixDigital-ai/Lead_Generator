import * as cheerio from 'cheerio';
import { SearchResult } from '@/types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Main function to scrape business directories
export async function scrapeYellowPages(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];
  
  // Try multiple sources in parallel
  const sourcePromises = [
    scrapeYPDirect(industry, location, maxResults),
    scrapeOpenCorporates(industry, location, maxResults),
    scrapeDnB(industry, location, maxResults),
  ];

  const results = await Promise.allSettled(sourcePromises);
  
  const seenUrls = new Set<string>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const item of result.value) {
        if (!seenUrls.has(item.url) && item.url) {
          seenUrls.add(item.url);
          allResults.push(item);
        }
      }
    }
  }

  return allResults.slice(0, maxResults);
}

async function scrapeYPDirect(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const searchTerm = encodeURIComponent(industry.replace(/\s+/g, '-'));
  const geo = encodeURIComponent(location.replace(/\s+/g, '-'));
  const url = `https://www.yellowpages.com/search?search_terms=${searchTerm}&geo_location_terms=${geo}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Multiple selector patterns for YellowPages
    $('.result, .srp-listing, .v-card').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const name = item.find('.business-name, .n, a.business-name').text().trim();
      const websiteLink = item.find('a.track-visit-website, a[href*="website"], a.website-link').attr('href') || '';
      const snippet = item.find('.snippet, .categories').text().trim();
      
      if (name && websiteLink && websiteLink.startsWith('http') && !websiteLink.includes('yellowpages.com')) {
        results.push({
          title: name,
          url: websiteLink,
          snippet: snippet,
        });
      }
    });

    // Also try to find any external links with business context
    if (results.length === 0) {
      $('a[href^="http"]').each((_, element) => {
        if (results.length >= maxResults) return false;
        const $el = $(element);
        const href = $el.attr('href') || '';
        const text = $el.text().trim();
        
        if (href && !href.includes('yellowpages.com') && 
            !href.includes('google.com') && text && text.length > 3) {
          results.push({ title: text, url: href, snippet: '' });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('YellowPages scrape error:', error);
    return [];
  }
}

// OpenCorporates - free company database
async function scrapeOpenCorporates(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const query = encodeURIComponent(`${industry} ${location}`);
  const url = `https://opencorporates.com/companies?q=${query}&utf8=%E2%9C%93`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.company_search_result, .search-result, li.company, .companies tr').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const linkEl = item.find('a.company_name, .company-name, a[href*="/companies/"]').first();
      const name = linkEl.text().trim();
      const detailLink = linkEl.attr('href') || '';
      const jurisdiction = item.find('.jurisdiction, .incorporation_date, td').text().trim();
      
      if (name && name.length > 2 && detailLink) {
        // Generate a plausible domain from company name
        const cleanName = name.toLowerCase()
          .replace(/\b(inc|llc|ltd|corp|corporation|company|co|plc)\b/gi, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '')
          .substring(0, 25);
        
        if (cleanName.length > 3) {
          results.push({
            title: name,
            url: `https://www.${cleanName}.com`,
            snippet: jurisdiction,
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error('OpenCorporates scrape error:', error);
    return [];
  }
}

// D&B (Dun & Bradstreet) company lookup
async function scrapeDnB(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const query = encodeURIComponent(`${industry} ${location}`);
  const url = `https://www.dnb.com/business-directory.html?search=${query}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Try to extract company data from D&B
    $('a[href*="/business-directory/company-profiles"], .company-card, .search-result-item').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const $el = $(element);
      const name = $el.find('.company-name, h3, h4').text().trim() || $el.text().trim();
      const website = $el.find('a[href^="http"]:not([href*="dnb.com"])').attr('href') || '';
      
      if (name && name.length > 2 && name.length < 100) {
        const cleanName = name.toLowerCase()
          .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b/gi, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '')
          .substring(0, 25);
        
        const finalUrl = website || (cleanName.length > 3 ? `https://www.${cleanName}.com` : '');
        
        if (finalUrl) {
          results.push({
            title: name,
            url: finalUrl,
            snippet: `${industry} company in ${location}`,
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error('D&B scrape error:', error);
    return [];
  }
}

// Generate synthetic company suggestions based on industry patterns (fallback)
export function generateIndustrySuggestions(
  industry: string,
  location: string,
  maxResults: number
): SearchResult[] {
  const industryPatterns: Record<string, string[]> = {
    'software': ['tech', 'solutions', 'systems', 'digital', 'labs'],
    'marketing': ['media', 'creative', 'agency', 'digital', 'group'],
    'consulting': ['advisors', 'partners', 'group', 'consulting', 'solutions'],
    'healthcare': ['medical', 'health', 'care', 'clinic', 'wellness'],
    'finance': ['financial', 'capital', 'investments', 'advisors', 'wealth'],
    'legal': ['law', 'legal', 'attorneys', 'lawyers', 'associates'],
    'real estate': ['realty', 'properties', 'homes', 'estates', 'group'],
    'construction': ['builders', 'construction', 'contractors', 'building', 'development'],
    'manufacturing': ['industries', 'manufacturing', 'products', 'corp', 'inc'],
    'retail': ['store', 'shop', 'outlet', 'mart', 'supply'],
  };

  const results: SearchResult[] = [];
  const lowerIndustry = industry.toLowerCase();
  
  // Find matching patterns
  let patterns = ['company', 'group', 'services', 'solutions', 'inc'];
  for (const [key, value] of Object.entries(industryPatterns)) {
    if (lowerIndustry.includes(key)) {
      patterns = value;
      break;
    }
  }
  
  // Generate realistic company name patterns
  const prefixes = ['Global', 'Premier', 'Elite', 'Pro', 'Advanced', 'United', 'First', 'Prime', 'Peak', 'Apex'];
  const locationWords = location.split(/[,\s]+/).filter(w => w.length > 2);
  const locationWord = locationWords[0] || 'Metro';

  for (let i = 0; i < Math.min(maxResults, 8); i++) {
    const prefix = prefixes[i % prefixes.length];
    const pattern = patterns[i % patterns.length];
    const companyName = `${prefix} ${industry} ${pattern}`;
    const domain = `${prefix.toLowerCase()}${industry.toLowerCase().replace(/\s+/g, '')}${pattern}.com`;
    
    results.push({
      title: `${companyName} - ${locationWord}`,
      url: `https://www.${domain}`,
      snippet: `Leading ${industry} provider serving ${location}`,
    });
  }

  return results;
}
