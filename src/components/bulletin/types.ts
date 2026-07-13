export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  isDefault?: boolean;
  isActive?: boolean;
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
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  contentSnippet: string;
  content: string;
  image?: string;
}
