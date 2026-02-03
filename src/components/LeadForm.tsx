'use client';

import { useState } from 'react';

interface LeadFormProps {
  onSubmit: (industry: string, location: string, maxResults: number) => void;
  isLoading: boolean;
}

export default function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (industry.trim() && location.trim()) {
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
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 
                           bg-slate-50 text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base"
                required
                minLength={2}
                maxLength={100}
                disabled={isLoading}
              />
            </div>
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
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 
                           bg-slate-50 text-slate-800
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                           placeholder-slate-400 transition-all text-base"
                required
                minLength={2}
                maxLength={100}
                disabled={isLoading}
              />
            </div>
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
