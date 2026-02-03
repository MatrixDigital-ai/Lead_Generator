import { SearchResult } from '@/types';
import { extractDomain, generateCompanyName } from '@/lib/utils';

export interface ExtractedDomain {
  companyName: string;
  website: string;
  domain: string;
}

const EXCLUDED_DOMAINS = [
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'instagram.com',
  'youtube.com',
  'tiktok.com',
  'pinterest.com',
  'reddit.com',
  'wikipedia.org',
  'yelp.com',
  'yellowpages.com',
  'bbb.org',
  'indeed.com',
  'glassdoor.com',
  'crunchbase.com',
  'bloomberg.com',
  'forbes.com',
  'google.com',
  'apple.com',
  'amazon.com',
  'microsoft.com',
  'gov',
  'edu',
];

function isExcludedDomain(domain: string): boolean {
  return EXCLUDED_DOMAINS.some(
    excluded => domain.includes(excluded) || domain.endsWith('.gov') || domain.endsWith('.edu')
  );
}

export function extractDomainsFromResults(results: SearchResult[]): ExtractedDomain[] {
  const domains: ExtractedDomain[] = [];
  const seenDomains = new Set<string>();

  for (const result of results) {
    try {
      const domain = extractDomain(result.url);
      
      if (!domain || seenDomains.has(domain) || isExcludedDomain(domain)) {
        continue;
      }

      seenDomains.add(domain);
      
      // Try to extract company name from title, fallback to domain
      let companyName = result.title
        .split(/[|\-–—:]/)[0]
        .trim()
        .replace(/\s+(Inc|LLC|Ltd|Corp|Company|Co)\.?$/i, '')
        .trim();

      if (!companyName || companyName.length < 2) {
        companyName = generateCompanyName(domain);
      }

      domains.push({
        companyName,
        website: result.url,
        domain,
      });
    } catch {
      // Skip invalid URLs
      continue;
    }
  }

  return domains;
}
