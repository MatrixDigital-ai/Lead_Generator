'use client';

import { useState } from 'react';

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
];

// Common location patterns
const LOCATION_PATTERNS = [
  // Cities, states, countries - just check for reasonable text
  /^[a-zA-Z\s,.-]+$/,
];

// Invalid patterns
const INVALID_PATTERNS = [
  /^[0-9]+$/, // Only numbers
  /^[^a-zA-Z]+$/, // No letters at all
  /(.)\1{4,}/, // Same character repeated 5+ times
  /^(test|asdf|qwerty|abc|xyz|xxx|aaa|bbb|123|hello|hi|bye|null|undefined|none|na|n\/a)$/i,
];

function validateIndustry(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  
  if (trimmed.length < 2) {
    return 'Industry must be at least 2 characters';
  }
  
  if (trimmed.length > 100) {
    return 'Industry is too long';
  }
  
  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(trimmed)) {
      return 'Please enter a valid industry (e.g., Software, Healthcare, Finance)';
    }
  }
  
  // Check if it contains at least one valid industry keyword or is reasonably formatted
  const hasValidKeyword = VALID_INDUSTRIES.some(keyword => 
    trimmed.includes(keyword) || keyword.includes(trimmed)
  );
  
  const hasLetters = /[a-zA-Z]{2,}/.test(trimmed);
  const isReasonableFormat = /^[a-zA-Z][a-zA-Z\s&-]*[a-zA-Z]$/.test(trimmed) || /^[a-zA-Z]{2,}$/.test(trimmed);
  
  if (!hasValidKeyword && !isReasonableFormat) {
    return 'Please enter a valid industry (e.g., Software Development, Healthcare, Marketing)';
  }
  
  if (!hasLetters) {
    return 'Industry must contain letters';
  }
  
  return null;
}

function validateLocation(value: string): string | null {
  const trimmed = value.trim();
  
  if (trimmed.length < 2) {
    return 'Location must be at least 2 characters';
  }
  
  if (trimmed.length > 100) {
    return 'Location is too long';
  }
  
  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(trimmed.toLowerCase())) {
      return 'Please enter a valid location (e.g., New York, California, USA)';
    }
  }
  
  // Must have letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) {
    return 'Location must contain letters';
  }
  
  // Should look like a location (letters, spaces, commas, periods)
  if (!/^[a-zA-Z][a-zA-Z\s,.-]*[a-zA-Z.]?$/.test(trimmed) && !/^[a-zA-Z]{2,}$/.test(trimmed)) {
    return 'Please enter a valid location (e.g., New York, London, India)';
  }
  
  return null;
}

export default function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    if (industryError && value.trim()) {
      setIndustryError(null);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (locationError && value.trim()) {
      setLocationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const indError = validateIndustry(industry);
    const locError = validateLocation(location);
    
    setIndustryError(indError);
    setLocationError(locError);
    
    if (indError || locError) {
      return;
    }
    
    onSubmit(industry.trim(), location.trim(), maxResults);
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
                onChange={(e) => handleIndustryChange(e.target.value)}
                placeholder="e.g., Software Development, Healthcare, Finance"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border 
                           ${industryError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'} 
                           text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base`}
                required
                minLength={2}
                maxLength={100}
                disabled={isLoading}
              />
            </div>
            {industryError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {industryError}
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
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="e.g., New York, California, United States"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border 
                           ${locationError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'} 
                           text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base`}
                required
                minLength={2}
                maxLength={100}
                disabled={isLoading}
              />
            </div>
            {locationError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {locationError}
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
          disabled={isLoading || !industry.trim() || !location.trim()}
          className="w-full mt-6 py-4 px-6 matrix-gradient
                     text-white font-semibold rounded-xl
                     transform transition-all duration-200 
                     hover:opacity-90 hover:shadow-lg
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
