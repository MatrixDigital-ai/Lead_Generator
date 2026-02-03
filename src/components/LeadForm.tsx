'use client';

import { useState, useMemo } from 'react';

interface LeadFormProps {
  onSubmit: (industry: string, location: string, maxResults: number) => void;
  isLoading: boolean;
}

// Valid industry keywords
const VALID_INDUSTRIES = [
  'software', 'technology', 'tech', 'it', 'healthcare', 'medical', 'health', 'finance', 'financial',
  'banking', 'insurance', 'real estate', 'realty', 'construction', 'manufacturing', 'retail',
  'ecommerce', 'e-commerce', 'marketing', 'advertising', 'media', 'consulting', 'legal', 'law',
  'education', 'training', 'hospitality', 'hotel', 'restaurant', 'food', 'beverage', 'automotive',
  'logistics', 'shipping', 'transportation', 'travel', 'tourism', 'energy', 'oil', 'gas', 'renewable',
  'telecom', 'telecommunications', 'pharma', 'pharmaceutical', 'biotech', 'agriculture', 'farming',
  'textile', 'fashion', 'apparel', 'beauty', 'cosmetics', 'entertainment', 'gaming', 'sports',
  'fitness', 'wellness', 'saas', 'cloud', 'cybersecurity', 'security', 'ai', 'artificial intelligence',
  'data', 'analytics', 'hr', 'human resources', 'staffing', 'recruitment', 'accounting', 'tax',
  'architecture', 'design', 'engineering', 'aerospace', 'defense', 'government', 'nonprofit',
  'publishing', 'printing', 'packaging', 'chemicals', 'plastics', 'metals', 'mining', 'electronics',
  'semiconductors', 'hardware', 'furniture', 'home', 'garden', 'pet', 'veterinary', 'dental',
  'optometry', 'mental health', 'therapy', 'cleaning', 'janitorial', 'plumbing', 'electrical',
  'hvac', 'roofing', 'landscaping', 'photography', 'video', 'music', 'art', 'craft', 'jewelry',
  'agency', 'services', 'solutions', 'development', 'web', 'mobile', 'app', 'digital', 'startup',
];

// Invalid patterns
const INVALID_PATTERNS = [
  /^[0-9]+$/, // Only numbers
  /^[^a-zA-Z]+$/, // No letters at all
  /(.)\1{4,}/, // Same character repeated 5+ times
  /^(test|asdf|qwerty|abc|xyz|xxx|aaa|bbb|123|hello|hi|bye|null|undefined|none|na|n\/a)$/i,
];

function isValidIndustry(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  
  if (trimmed.length < 2) return false;
  if (trimmed.length > 100) return false;
  
  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  
  // Must have letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;
  
  // Check if contains valid industry keyword or is reasonably formatted
  const hasValidKeyword = VALID_INDUSTRIES.some(keyword => 
    trimmed.includes(keyword) || keyword.includes(trimmed)
  );
  
  const isReasonableFormat = /^[a-zA-Z][a-zA-Z\s&-]*[a-zA-Z]$/.test(trimmed) || /^[a-zA-Z]{2,}$/.test(trimmed);
  
  return hasValidKeyword || isReasonableFormat;
}

function isValidLocation(value: string): boolean {
  const trimmed = value.trim();
  
  if (trimmed.length < 2) return false;
  if (trimmed.length > 100) return false;
  
  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(trimmed.toLowerCase())) return false;
  }
  
  // Must have letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;
  
  // Should look like a location (letters, spaces, commas, periods)
  const looksLikeLocation = /^[a-zA-Z][a-zA-Z\s,.-]*[a-zA-Z.]?$/.test(trimmed) || /^[a-zA-Z]{2,}$/.test(trimmed);
  
  return looksLikeLocation;
}

function getIndustryHint(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isValidIndustry(value)) return null;
  return 'Enter a valid industry (e.g., Software, Healthcare, Finance)';
}

function getLocationHint(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isValidLocation(value)) return null;
  return 'Enter a valid location (e.g., New York, California, USA)';
}

export default function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(10);

  // Real-time validation
  const industryValid = useMemo(() => isValidIndustry(industry), [industry]);
  const locationValid = useMemo(() => isValidLocation(location), [location]);
  const industryHint = useMemo(() => getIndustryHint(industry), [industry]);
  const locationHint = useMemo(() => getLocationHint(location), [location]);
  
  // Button is only enabled when both inputs are valid
  const isFormValid = industryValid && locationValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isLoading) {
      onSubmit(industry.trim(), location.trim(), maxResults);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Powered Lead Discovery
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
          Find Your Next Business Opportunity
        </h2>
        <p className="text-slate-600 text-lg max-w-lg mx-auto">
          Enter an industry and location to discover qualified B2B leads with enriched company data.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 card-shadow-lg">
        <div className="space-y-5">
          {/* Industry Input */}
          <div>
            <label 
              htmlFor="industry" 
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Industry
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Software Development, Healthcare, Finance"
                className={`w-full pl-12 pr-10 py-3.5 rounded-xl border 
                           ${industry && !industryValid ? 'border-amber-400 bg-amber-50' : industry && industryValid ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'} 
                           text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base`}
                maxLength={100}
                disabled={isLoading}
              />
              {industry && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {industryValid ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {industryHint && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {industryHint}
              </p>
            )}
          </div>

          {/* Location Input */}
          <div>
            <label 
              htmlFor="location" 
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, California, United States"
                className={`w-full pl-12 pr-10 py-3.5 rounded-xl border 
                           ${location && !locationValid ? 'border-amber-400 bg-amber-50' : location && locationValid ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'} 
                           text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base`}
                maxLength={100}
                disabled={isLoading}
              />
              {location && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {locationValid ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {locationHint && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {locationHint}
              </p>
            )}
          </div>

          {/* Max Results Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label 
                htmlFor="maxResults" 
                className="text-sm font-semibold text-slate-700"
              >
                Number of Leads
              </label>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {maxResults} leads
              </span>
            </div>
            <input
              type="range"
              id="maxResults"
              min="5"
              max="50"
              step="5"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full mt-6 py-4 px-6 
                     ${isFormValid ? 'matrix-gradient hover:opacity-90 hover:shadow-lg' : 'bg-slate-300 cursor-not-allowed'}
                     text-white font-semibold rounded-xl
                     transform transition-all duration-200 
                     active:scale-[0.98]
                     disabled:opacity-70 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Discovering Leads...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Generate Leads
            </span>
          )}
        </button>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-slate-600 font-medium">Website Health</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-slate-600 font-medium">Email Discovery</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs text-slate-600 font-medium">Lead Scoring</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
