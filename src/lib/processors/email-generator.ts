const EMAIL_PATTERNS = [
  'info',
  'contact',
  'hello',
  'sales',
  'support',
  'admin',
  'office',
  'enquiries',
  'inquiries',
  'team',
];

export function generateEmailGuesses(domain: string): string[] {
  // Generate top 5 most common business email patterns
  return EMAIL_PATTERNS.slice(0, 5).map(pattern => `${pattern}@${domain}`);
}

export function generatePrimaryEmail(domain: string): string {
  return `info@${domain}`;
}
