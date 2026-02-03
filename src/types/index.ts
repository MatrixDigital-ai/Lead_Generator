export interface Lead {
  companyName: string;
  website: string;
  domain: string;
  emails: string[];
  websiteStatus: 'live' | 'down' | 'unknown';
  responseTime: number | null;
  businessModel: 'B2B' | 'B2C' | 'Unknown';
  score: number;
}

export interface GenerateLeadsRequest {
  industry: string;
  location: string;
  maxResults: number;
}

export interface GenerateLeadsResponse {
  leads: Lead[];
  error?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebsiteHealth {
  status: 'live' | 'down' | 'unknown';
  responseTime: number | null;
  isHttps: boolean;
  hasBusinessKeywords: boolean;
}
