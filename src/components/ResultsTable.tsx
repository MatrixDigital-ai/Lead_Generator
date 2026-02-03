'use client';

import { useState } from 'react';
import { Lead } from '@/types';
import { downloadCSV } from '@/lib/processors/csv-generator';

interface ResultsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

type SortField = 'companyName' | 'score' | 'websiteStatus' | 'businessModel';
type SortDirection = 'asc' | 'desc';

export default function ResultsTable({ leads, isLoading }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-700 text-lg font-medium mt-6">
              Discovering leads...
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Searching databases and enriching company data
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return null;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'companyName':
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'websiteStatus':
        comparison = a.websiteStatus.localeCompare(b.websiteStatus);
        break;
      case 'businessModel':
        comparison = a.businessModel.localeCompare(b.businessModel);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Live
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Down
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
            Unknown
          </span>
        );
    }
  };

  const getBusinessBadge = (model: string) => {
    switch (model) {
      case 'B2B':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">B2B</span>;
      case 'B2C':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 border border-violet-200">B2C</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-600 border border-slate-200">—</span>;
    }
  };

  const getScoreDisplay = (score: number) => {
    let bgColor = 'bg-slate-100';
    let textColor = 'text-slate-600';
    let borderColor = 'border-slate-200';
    
    if (score >= 80) {
      bgColor = 'bg-emerald-50';
      textColor = 'text-emerald-700';
      borderColor = 'border-emerald-200';
    } else if (score >= 60) {
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-200';
    } else if (score >= 40) {
      bgColor = 'bg-amber-50';
      textColor = 'text-amber-700';
      borderColor = 'border-amber-200';
    } else {
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-200';
    }
    
    return (
      <span className={`inline-flex items-center justify-center w-12 h-8 text-sm font-bold rounded-lg ${bgColor} ${textColor} border ${borderColor}`}>
        {score}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1.5 inline-block">
      {sortField === field ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sortDirection === 'asc' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      ) : (
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )}
    </span>
  );

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Discovery Complete
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Found <span className="font-semibold text-slate-700">{leads.length}</span> qualified leads
            </p>
          </div>
          <button
            onClick={() => downloadCSV(leads, `matrix-ai-leads-${new Date().toISOString().split('T')[0]}.csv`)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl
                       flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('companyName')}
                >
                  <span className="flex items-center">Company <SortIcon field="companyName" /></span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('websiteStatus')}
                >
                  <span className="flex items-center">Health <SortIcon field="websiteStatus" /></span>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('businessModel')}
                >
                  <span className="flex items-center">Type <SortIcon field="businessModel" /></span>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <span className="flex items-center">Score <SortIcon field="score" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead, index) => (
                <tr 
                  key={`${lead.domain}-${index}`}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                        {lead.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {lead.companyName}
                        </div>
                        <a 
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {lead.domain}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 font-medium">
                      {lead.emails[0]}
                    </div>
                    {lead.emails.length > 1 && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        +{lead.emails.length - 1} more emails
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {getStatusBadge(lead.websiteStatus)}
                      {lead.responseTime && (
                        <span className="text-xs text-slate-400">
                          {lead.responseTime}ms response
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getBusinessBadge(lead.businessModel)}
                  </td>
                  <td className="px-6 py-4">
                    {getScoreDisplay(lead.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, leads.length)} of {leads.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
