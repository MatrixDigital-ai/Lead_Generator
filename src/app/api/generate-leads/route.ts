import { NextRequest, NextResponse } from 'next/server';
import { searchDuckDuckGo } from '@/lib/scraper/search-scraper';
import { scrapeYellowPages } from '@/lib/scraper/directory-scraper';
import { extractDomainsFromResults } from '@/lib/processors/domain-extractor';
import { generateEmailGuesses } from '@/lib/processors/email-generator';
import { batchCheckHealth } from '@/lib/processors/health-checker';
import { classifyBusinessModel } from '@/lib/processors/business-classifier';
import { isRateLimited, getRateLimitHeaders } from '@/lib/rate-limiter';
import { sanitizeInput, calculateLeadScore, delay } from '@/lib/utils';
import { Lead, GenerateLeadsRequest, GenerateLeadsResponse, SearchResult } from '@/types';

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

    console.log(`[LeadGen] Starting search for: ${industry} in ${location}, max: ${maxResults}`);

    // Step 1: Search for companies using multiple sources
    let searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // Try search engines first
    const engineResults = await searchDuckDuckGo(industry, location, maxResults * 3);
    console.log(`[LeadGen] Search engines returned: ${engineResults.length} results`);
    
    for (const result of engineResults) {
      if (!seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        searchResults.push(result);
      }
    }

    // If we don't have enough results, try Yellow Pages
    if (searchResults.length < maxResults) {
      await delay(200);
      const ypResults = await scrapeYellowPages(industry, location, maxResults);
      console.log(`[LeadGen] Yellow Pages returned: ${ypResults.length} results`);
      
      for (const result of ypResults) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          searchResults.push(result);
        }
      }
    }

    console.log(`[LeadGen] Total unique results: ${searchResults.length}`);
    
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
