import * as cheerio from 'cheerio';
import { SearchResult } from '@/types';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Scrape Yellow Pages for business listings
export async function scrapeYellowPages(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const searchTerm = encodeURIComponent(industry.replace(/\s+/g, '-'));
  const geo = encodeURIComponent(location.replace(/\s+/g, '-'));
  const url = `https://www.yellowpages.com/search?search_terms=${searchTerm}&geo_location_terms=${geo}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.result').each((_, element) => {
      if (results.length >= maxResults) return false;
      
      const item = $(element);
      const name = item.find('.business-name').text().trim();
      const websiteLink = item.find('a.track-visit-website').attr('href') || '';
      const snippet = item.find('.snippet').text().trim();
      
      if (name && websiteLink && websiteLink.startsWith('http')) {
        results.push({
          title: name,
          url: websiteLink,
          snippet: snippet,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('YellowPages scrape error:', error);
    return [];
  }
}

// Scrape Yelp for business listings
export async function scrapeYelp(
  industry: string,
  location: string,
  maxResults: number
): Promise<SearchResult[]> {
  const searchTerm = encodeURIComponent(industry);
  const geo = encodeURIComponent(location);
  const url = `https://www.yelp.com/search?find_desc=${searchTerm}&find_loc=${geo}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Yelp uses React, so we need to look for data in script tags
    $('script').each((_, element) => {
      const scriptContent = $(element).html() || '';
      if (scriptContent.includes('businessUrl') && scriptContent.includes('name')) {
        try {
          // Try to extract business data from script
          const matches = scriptContent.matchAll(/"businessUrl":"([^"]+)".*?"name":"([^"]+)"/g);
          for (const match of matches) {
            if (results.length >= maxResults) break;
            const businessUrl = match[1].replace(/\\\//g, '/');
            const name = match[2];
            if (businessUrl.startsWith('http') && !businessUrl.includes('yelp.com')) {
              results.push({ title: name, url: businessUrl, snippet: '' });
            }
          }
        } catch {
          // Continue if parsing fails
        }
      }
    });

    return results;
  } catch (error) {
    console.error('Yelp scrape error:', error);
    return [];
  }
}

// Generate synthetic company suggestions based on industry patterns
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

  // Generate location-based TLD suggestions
  const locationParts = location.toLowerCase().split(/[,\s]+/).filter(p => p.length > 2);
  const locationAbbr = locationParts.map(p => p.charAt(0)).join('');
  
  // These are just placeholders - they help when search engines fail completely
  // Real results will come from actual scraping
  for (let i = 0; i < Math.min(maxResults, 5); i++) {
    const pattern = patterns[i % patterns.length];
    const name = `${industry} ${pattern}`;
    results.push({
      title: `${name} - ${location}`,
      url: `https://example-${industry.toLowerCase().replace(/\s+/g, '')}-${pattern}.com`,
      snippet: `${industry} ${pattern} serving ${location}`,
    });
  }

  return results;
}
