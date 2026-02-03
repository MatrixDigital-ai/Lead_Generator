import * as cheerio from 'cheerio';
import { SearchResult } from '@/types';
import { delay } from '@/lib/utils';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function buildSearchQueries(industry: string, location: string): string[] {
  // Multiple query variations to get more results
  return [
    `${industry} companies in ${location}`,
    `${industry} businesses ${location}`,
    `top ${industry} firms ${location}`,
    `${industry} agencies ${location}`,
    `best ${industry} services ${location}`,
  ];
}

export async function searchDuckDuckGo(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const queries = buildSearchQueries(industry, location);
  const allResults: SearchResult[] = [];
  const seenUrls = new Set<string>();

  // Try multiple queries to get more results
  for (const query of queries) {
    if (allResults.length >= maxResults) break;
    
    const results = await tryMultipleSources(query, maxResults - allResults.length);
    
    for (const result of results) {
      if (!seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        allResults.push(result);
      }
    }
    
    // Small delay between queries to avoid rate limiting
    if (allResults.length < maxResults) {
      await delay(300);
    }
  }

  return allResults.slice(0, maxResults);
}

async function tryMultipleSources(query: string, maxResults: number): Promise<SearchResult[]> {
  // Try sources in order of reliability
  let results = await searchGoogle(query, maxResults);
  
  if (results.length < 3) {
    const bingResults = await searchBing(query, maxResults);
    results = [...results, ...bingResults];
  }
  
  if (results.length < 3) {
    const ddgResults = await searchDDG(query, maxResults);
    results = [...results, ...ddgResults];
  }

  return results;
}

async function searchGoogle(query: string, maxResults: number): Promise<SearchResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.google.com/search?q=${encodedQuery}&num=${Math.min(maxResults + 10, 30)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.log('Google search failed with status:', response.status);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Parse Google search results - multiple selectors for robustness
    $('div.g').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const linkEl = item.find('a').first();
      const href = linkEl.attr('href') || '';
      const title = item.find('h3').first().text().trim();
      const snippet = item.find('div[data-sncf]').text().trim() || 
                      item.find('.VwiC3b').text().trim() ||
                      item.find('span.st').text().trim();

      if (isValidUrl(href) && title) {
        results.push({ title, url: href, snippet });
      }
    });

    // Alternative selector pattern
    if (results.length === 0) {
      $('a').each((_, element) => {
        if (results.length >= maxResults) return false;
        
        const link = $(element);
        const href = link.attr('href') || '';
        const title = link.find('h3').text().trim() || link.text().trim();
        
        if (isValidUrl(href) && title && title.length > 3) {
          results.push({ title, url: href, snippet: '' });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
}

async function searchBing(query: string, maxResults: number): Promise<SearchResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.bing.com/search?q=${encodedQuery}&count=${maxResults + 5}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('li.b_algo').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const titleLink = item.find('h2 a');
      const href = titleLink.attr('href') || '';
      const title = titleLink.text().trim();
      const snippet = item.find('.b_caption p').text().trim();

      if (isValidUrl(href) && title) {
        results.push({ title, url: href, snippet });
      }
    });

    return results;
  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

async function searchDDG(query: string, maxResults: number): Promise<SearchResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.result').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const titleLink = item.find('.result__a');
      const href = titleLink.attr('href') || '';
      const title = titleLink.text().trim();
      const snippet = item.find('.result__snippet').text().trim();

      // DDG uses redirect URLs, extract the actual URL
      const actualUrl = extractDDGUrl(href);
      
      if (isValidUrl(actualUrl) && title) {
        results.push({ title, url: actualUrl, snippet });
      }
    });

    return results;
  } catch (error) {
    console.error('DDG search error:', error);
    return [];
  }
}

function extractDDGUrl(ddgUrl: string): string {
  try {
    if (ddgUrl.includes('uddg=')) {
      const match = ddgUrl.match(/uddg=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    return ddgUrl;
  } catch {
    return ddgUrl;
  }
}

function isValidUrl(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  
  const excludedDomains = [
    'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com',
    'facebook.com', 'twitter.com', 'linkedin.com/search',
    'instagram.com', 'youtube.com', 'tiktok.com', 
    'pinterest.com', 'reddit.com/search',
    'wikipedia.org', 'amazon.com', 'ebay.com',
    'webcache.googleusercontent.com',
  ];
  
  return !excludedDomains.some(domain => url.includes(domain));
}
