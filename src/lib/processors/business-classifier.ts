const B2B_KEYWORDS = [
  'enterprise',
  'business solutions',
  'b2b',
  'wholesale',
  'corporate',
  'commercial',
  'industrial',
  'manufacturing',
  'supplier',
  'vendor',
  'distributor',
  'logistics',
  'procurement',
  'consulting',
  'professional services',
  'saas',
  'software',
  'api',
  'platform',
  'integration',
  'analytics',
  'data services',
  'cloud services',
  'it services',
  'managed services',
  'outsourcing',
  'staffing',
  'recruitment agency',
  'trade',
  'oem',
  'bulk',
  'fleet',
  'contractor',
];

const B2C_KEYWORDS = [
  'shop',
  'store',
  'buy now',
  'add to cart',
  'free shipping',
  'sale',
  'discount',
  'retail',
  'customer',
  'consumer',
  'personal',
  'family',
  'home',
  'lifestyle',
  'fashion',
  'beauty',
  'food',
  'restaurant',
  'cafe',
  'hotel',
  'travel',
  'vacation',
  'entertainment',
  'gaming',
  'fitness',
  'health',
  'wellness',
  'spa',
  'salon',
  'pet',
  'kids',
  'baby',
  'gifts',
  'jewelry',
  'clothing',
  'shoes',
  'electronics',
  'furniture',
  'decor',
];

export function classifyBusinessModel(
  domain: string,
  companyName: string,
  snippet: string = ''
): 'B2B' | 'B2C' | 'Unknown' {
  const text = `${domain} ${companyName} ${snippet}`.toLowerCase();
  
  let b2bScore = 0;
  let b2cScore = 0;

  // Count keyword matches
  for (const keyword of B2B_KEYWORDS) {
    if (text.includes(keyword)) {
      b2bScore += 1;
    }
  }

  for (const keyword of B2C_KEYWORDS) {
    if (text.includes(keyword)) {
      b2cScore += 1;
    }
  }

  // Determine classification
  if (b2bScore > b2cScore && b2bScore >= 2) {
    return 'B2B';
  } else if (b2cScore > b2bScore && b2cScore >= 2) {
    return 'B2C';
  } else if (b2bScore > 0 && b2cScore === 0) {
    return 'B2B';
  } else if (b2cScore > 0 && b2bScore === 0) {
    return 'B2C';
  }

  return 'Unknown';
}
