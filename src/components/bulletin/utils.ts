export const formatTimeAgo = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} saat önce`;
    return `${Math.floor(diffHrs / 24)} gün önce`;
  } catch {
    return dateStr;
  }
};

export const ensureString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (typeof val._ === 'string') return val._;
    if (val._ !== undefined) return String(val._);
    if (Array.isArray(val)) {
      return val.map(ensureString).filter(Boolean).join(' ');
    }
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const nonAttrKeys = keys.filter(k => k !== '$');
      if (nonAttrKeys.length > 0) {
        const firstVal = val[nonAttrKeys[0]];
        return ensureString(firstVal);
      }
    }
    return '';
  }
  return String(val);
};

export const ensureLink = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val.$ && typeof val.$.href === 'string') return val.$.href;
    if (typeof val._ === 'string') return val._;
    if (val.href && typeof val.href === 'string') return val.href;
  }
  return ensureString(val);
};
