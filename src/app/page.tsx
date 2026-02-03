'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import ResultsTable from '@/components/ResultsTable';
import { Lead, GenerateLeadsResponse } from '@/types';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLeads = async (industry: string, location: string, maxResults: number) => {
    setIsLoading(true);
    setError(null);
    setLeads([]);

    try {
      const response = await fetch('/api/generate-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ industry, location, maxResults }),
      });

      const data: GenerateLeadsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate leads');
      }

      if (data.error && data.leads.length === 0) {
        setError(data.error);
      } else {
        setLeads(data.leads);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg matrix-gradient flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Matrix AI</h1>
                <p className="text-xs text-slate-500">Lead Generator</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">Features</span>
              <span className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">Pricing</span>
              <span className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">About</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <LeadForm onSubmit={handleGenerateLeads} isLoading={isLoading} />
          
          {error && (
            <div className="w-full max-w-2xl mx-auto mt-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <ResultsTable leads={leads} isLoading={isLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg matrix-gradient flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-slate-800 font-semibold">Matrix AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Intelligent Lead Discovery</span>
              <span className="hidden md:inline">•</span>
              <span>Powered by AI</span>
            </div>
            <p className="text-sm text-slate-400">© 2026 Matrix AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
