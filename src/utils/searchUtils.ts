
export interface SearchField {
  key: string;
  value: string;
}

export const parseSearchTerm = (term: string) => {
  const parts = term.split(/\s+/);
  const filters: SearchField[] = [];
  const keywords: string[] = [];

  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':');
      if (key && value) {
        filters.push({ key: key.toLowerCase(), value: value.toLowerCase() });
      } else {
        keywords.push(part.toLowerCase());
      }
    } else if (part) {
      keywords.push(part.toLowerCase());
    }
  });

  return { filters, keywords };
};

export const smartFilter = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  prefixMap: Record<string, keyof T | ((item: T) => string)>
) => {
  if (!searchTerm.trim()) return items;

  const { filters, keywords } = parseSearchTerm(searchTerm);

  return items.filter(item => {
    // Check keywords (OR logic within keywords, but item must match ALL keywords for AND logic)
    // Actually, usually search is AND between space-separated terms
    const matchesKeywords = keywords.every(kw => {
      return searchFields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(kw);
        if (typeof val === 'number') return val.toString().includes(kw);
        return false;
      });
    });

    if (!matchesKeywords && keywords.length > 0) return false;

    // Check filters (AND logic)
    const matchesFilters = filters.every(f => {
      const fieldKey = prefixMap[f.key];
      if (!fieldKey) return true; // Ignore unknown prefixes or treat as keywords?

      if (typeof fieldKey === 'function') {
        return fieldKey(item).toLowerCase().includes(f.value);
      }

      const val = item[fieldKey as keyof T];
      if (typeof val === 'string') return val.toLowerCase().includes(f.value);
      if (typeof val === 'number') return val.toString().includes(f.value);
      return false;
    });

    return matchesFilters;
  });
};
