export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  platform?: string;
  subCategory?: string;
  isDefault?: boolean;
  isActive?: boolean;
  icon?: string;
  lastFetched?: string;
  itemCount?: number;
  healthStatus?: 'healthy' | 'repaired' | 'broken' | 'checking';
  lastHealthCheck?: string;
  lastError?: string;
  originalUrl?: string;
}

export interface OPMLImportItem {
  title: string;
  url: string;
  category: string;
}

export interface ArticleItem {
  id: string;
  feedId: string;
  feedTitle: string;
  category: string;
  platform?: string;
  subCategory?: string;
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  contentSnippet: string;
  content: string;
  image?: string;
  isRead?: boolean;
  savedAt?: string;
  userNotes?: string;
  tags?: string[];
}

export interface AIDigestHighlight {
  topic: string;
  summary: string;
  impact: string;
  category: string;
}

export interface AIDigest {
  id: string;
  createdAt: string;
  title: string;
  greeting: string;
  highlights: AIDigestHighlight[];
  quickTakeaways: string[];
  editorNote: string;
}
