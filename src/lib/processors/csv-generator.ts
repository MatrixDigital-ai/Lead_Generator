import { Lead } from '@/types';

export function generateCSV(leads: Lead[]): string {
  const headers = [
    'Company Name',
    'Website',
    'Domain',
    'Emails',
    'Website Status',
    'Response Time (ms)',
    'Business Model',
    'Lead Score',
  ];

  const rows = leads.map(lead => [
    escapeCSV(lead.companyName),
    escapeCSV(lead.website),
    escapeCSV(lead.domain),
    escapeCSV(lead.emails.join('; ')),
    escapeCSV(lead.websiteStatus),
    lead.responseTime !== null ? lead.responseTime.toString() : 'N/A',
    escapeCSV(lead.businessModel),
    lead.score.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(leads: Lead[], filename: string = 'leads.csv'): void {
  const csv = generateCSV(leads);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
