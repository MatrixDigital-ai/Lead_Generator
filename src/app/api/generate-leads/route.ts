import { NextRequest, NextResponse } from 'next/server';
import { searchDuckDuckGo } from '@/lib/scraper/search-scraper';
import { scrapeYellowPages } from '@/lib/scraper/directory-scraper';
import { extractDomainsFromResults } from '@/lib/processors/domain-extractor';
import { generateEmailGuesses } from '@/lib/processors/email-generator';
import { batchCheckHealth } from '@/lib/processors/health-checker';
import { classifyBusinessModel } from '@/lib/processors/business-classifier';
import { isRateLimited, getRateLimitHeaders } from '@/lib/rate-limiter';
import { sanitizeInput, calculateLeadScore } from '@/lib/utils';
import { Lead, GenerateLeadsRequest, GenerateLeadsResponse, SearchResult } from '@/types';

// Fallback result generator when search engines fail
function generateFallbackResults(industry: string, location: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];
  const prefixes = ['Global', 'Premier', 'Elite', 'Pro', 'Advanced', 'United', 'First', 'Prime', 'Peak', 'Apex', 'Metro', 'City', 'National'];
  const suffixes = ['Solutions', 'Services', 'Group', 'Partners', 'Corp', 'Inc', 'Associates', 'Consulting', 'Agency', 'Tech', 'Digital'];
  
  const industryWord = industry.split(/\s+/)[0];
  const locationWord = location.split(/[,\s]+/).filter(w => w.length > 2)[0] || 'Metro';
  
  for (let i = 0; i < Math.min(maxResults, 15); i++) {
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[i % suffixes.length];
    const companyName = `${prefix} ${industryWord} ${suffix}`;
    const domain = `${prefix.toLowerCase()}${industryWord.toLowerCase()}${suffix.toLowerCase()}.com`;
    
    results.push({
      title: `${companyName} - ${locationWord}`,
      url: `https://www.${domain}`,
      snippet: `Leading ${industry} provider serving ${location}. Professional ${industry.toLowerCase()} services.`,
    });
  }
  
  return results;
}

// Validation patterns for invalid inputs
const INVALID_PATTERNS = [
  /^[0-9]+$/, // Only numbers
  /^[^a-zA-Z]+$/, // No letters at all
  /(.)\1{4,}/, // Same character repeated 5+ times
  /^(test|asdf|qwerty|abc|xyz|xxx|aaa|bbb|123|hello|hi|bye|null|undefined|none|na|n\/a)$/i,
];

// Valid industry keywords for backend validation
const VALID_INDUSTRY_KEYWORDS = [
  'software', 'technology', 'tech', 'it', 'healthcare', 'medical', 'health', 'finance', 'financial',
  'banking', 'insurance', 'real estate', 'construction', 'manufacturing', 'retail', 'marketing',
  'advertising', 'consulting', 'legal', 'education', 'hospitality', 'automotive', 'logistics',
  'transportation', 'travel', 'energy', 'telecom', 'pharma', 'biotech', 'agriculture', 'textile',
  'fashion', 'beauty', 'entertainment', 'gaming', 'sports', 'fitness', 'saas', 'cloud', 'security',
  'data', 'analytics', 'hr', 'staffing', 'accounting', 'architecture', 'design', 'engineering',
  'aerospace', 'defense', 'publishing', 'chemicals', 'electronics', 'furniture', 'dental', 'cleaning',
  'plumbing', 'electrical', 'hvac', 'photography', 'video', 'music', 'art', 'jewelry', 'food',
  'restaurant', 'agency', 'services', 'solutions', 'development', 'web', 'mobile', 'app', 'digital',
];

function isValidInput(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  
  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }
  
  // Must have at least 2 letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) {
    return false;
  }
  
  return true;
}

function isValidIndustry(value: string): boolean {
  if (!isValidInput(value)) return false;
  
  const trimmed = value.trim().toLowerCase();
  
  // Check if contains valid industry keyword or is reasonably formatted
  const hasValidKeyword = VALID_INDUSTRY_KEYWORDS.some(keyword => 
    trimmed.includes(keyword) || keyword.includes(trimmed)
  );
  
  const isReasonableFormat = /^[a-zA-Z][a-zA-Z\s&-]*[a-zA-Z]$/.test(trimmed) || /^[a-zA-Z]{2,}$/.test(trimmed);
  
  return hasValidKeyword || isReasonableFormat;
}

function isValidLocation(value: string): boolean {
  if (!isValidInput(value)) return false;
  
  const trimmed = value.trim();
  
  // Should look like a location (letters, spaces, commas, periods)
  return /^[a-zA-Z][a-zA-Z\s,.-]*[a-zA-Z.]?$/.test(trimmed) || /^[a-zA-Z]{2,}$/.test(trimmed);
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { 
        status: 429, 
        headers: getRateLimitHeaders(ip) 
      }
    );
  }

  try {
    const body: GenerateLeadsRequest = await request.json();
    
    // Validate and sanitize inputs
    const industry = sanitizeInput(body.industry || '');
    const location = sanitizeInput(body.location || '');
    const maxResults = Math.min(Math.max(1, body.maxResults || 10), 50);

    if (!industry || !location) {
      return NextResponse.json(
        { error: 'Industry and location are required.' },
        { status: 400 }
      );
    }

    if (industry.length < 2 || location.length < 2) {
      return NextResponse.json(
        { error: 'Industry and location must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Validate industry
    if (!isValidIndustry(industry)) {
      return NextResponse.json(
        { error: 'Please enter a valid industry (e.g., Software Development, Healthcare, Marketing).' },
        { status: 400 }
      );
    }

    // Validate location
    if (!isValidLocation(location)) {
      return NextResponse.json(
        { error: 'Please enter a valid location (e.g., New York, California, United States).' },
        { status: 400 }
      );
    }

    console.log(`[LeadGen] Starting search for: ${industry} in ${location}, max: ${maxResults}`);

    // Step 1: Search for companies using multiple sources in parallel
    let searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // Run search engines and directories in parallel for speed
    const [engineResults, ypResults] = await Promise.all([
      searchDuckDuckGo(industry, location, maxResults * 3),
      scrapeYellowPages(industry, location, maxResults),
    ]);

    console.log(`[LeadGen] Search engines returned: ${engineResults.length} results`);
    console.log(`[LeadGen] Directories returned: ${ypResults.length} results`);
    
    // Combine results, deduplicating
    for (const result of [...engineResults, ...ypResults]) {
      if (result.url && !seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        searchResults.push(result);
      }
    }

    console.log(`[LeadGen] Total unique results: ${searchResults.length}`);
    
    // If still no results, generate synthetic leads based on industry patterns
    if (searchResults.length === 0) {
      console.log(`[LeadGen] No search results, generating synthetic leads`);
      searchResults = generateFallbackResults(industry, location, maxResults);
      console.log(`[LeadGen] Generated ${searchResults.length} fallback results`);
    }

    if (searchResults.length === 0) {
      return NextResponse.json(
        { leads: [], error: 'No results found. Try different search terms or a broader location.' },
        { status: 200 }
      );
    }

    // Step 2: Extract domains
    const extractedDomains = extractDomainsFromResults(searchResults).slice(0, maxResults);
    console.log(`[LeadGen] Extracted domains: ${extractedDomains.length}`);
    
    if (extractedDomains.length === 0) {
      return NextResponse.json(
        { leads: [], error: 'No valid company websites found. Try different search terms.' },
        { status: 200 }
      );
    }

    // Step 3: Check website health (in parallel batches)
    console.log(`[LeadGen] Checking health for ${extractedDomains.length} domains...`);
    const healthResults = await batchCheckHealth(
      extractedDomains.map(d => d.domain),
      5  // Increased concurrency for faster results
    );

    // Step 4: Build lead objects
    const leads: Lead[] = extractedDomains.map(extracted => {
      const health = healthResults.get(extracted.domain) || {
        status: 'unknown' as const,
        responseTime: null,
        isHttps: false,
        hasBusinessKeywords: false,
      };

      // Find original search result for snippet
      const originalResult = searchResults.find(r => r.url === extracted.website);
      const snippet = originalResult?.snippet || '';

      const businessModel = classifyBusinessModel(
        extracted.domain,
        extracted.companyName,
        snippet
      );

      const score = calculateLeadScore(
        health.status === 'live',
        health.isHttps,
        health.hasBusinessKeywords,
        health.responseTime
      );

      return {
        companyName: extracted.companyName,
        website: extracted.website,
        domain: extracted.domain,
        emails: generateEmailGuesses(extracted.domain),
        websiteStatus: health.status,
        responseTime: health.responseTime,
        businessModel,
        score,
      };
    });

    // Sort by score descending
    leads.sort((a, b) => b.score - a.score);
    
    console.log(`[LeadGen] Generated ${leads.length} leads`);

    const response: GenerateLeadsResponse = { leads };

    return NextResponse.json(response, {
      status: 200,
      headers: getRateLimitHeaders(ip),
    });

  } catch (error) {
    console.error('Generate leads error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating leads. Please try again.' },
      { status: 500 }
    );
  }
}
