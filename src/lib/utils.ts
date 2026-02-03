export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '')
    .slice(0, 200);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateCompanyName(domain: string): string {
  const name = domain
    .replace(/\.(com|org|net|io|co|biz|info|us|uk|ca|au|de|fr|es|it|nl|be|ch|at|se|no|dk|fi|ie|nz|sg|hk|jp|kr|cn|in|br|mx|ar|cl|za|ae|sa|il|eg|ng|ke|gh|tz|ug|rw|et|ma|dz|tn|ly|sd|so|mz|ao|bw|zw|zm|mw|mg|mu|sc|mv|lk|bd|np|pk|af|ir|iq|sy|lb|jo|ps|ye|om|kw|qa|bh|tr|gr|cy|mt|ru|ua|by|pl|cz|sk|hu|ro|bg|rs|hr|si|ba|mk|al|xk|me|lt|lv|ee|fi)$/i, '')
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return name || domain;
}

export function uniqueByDomain<T extends { domain: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.domain)) return false;
    seen.add(item.domain);
    return true;
  });
}

export function calculateLeadScore(
  websiteAlive: boolean,
  isHttps: boolean,
  hasBusinessKeywords: boolean,
  responseTime: number | null
): number {
  let score = 0;
  
  // Website alive: 40 points
  if (websiteAlive) score += 40;
  
  // HTTPS: 20 points
  if (isHttps) score += 20;
  
  // Business keywords: 25 points
  if (hasBusinessKeywords) score += 25;
  
  // Response time bonus: up to 15 points
  if (responseTime !== null && websiteAlive) {
    if (responseTime < 500) score += 15;
    else if (responseTime < 1000) score += 10;
    else if (responseTime < 2000) score += 5;
  }
  
  return Math.min(100, score);
}
