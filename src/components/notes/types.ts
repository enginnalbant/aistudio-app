export interface MemoAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'document' | 'file';
  url: string;
  size?: string;
  duration?: string; // For audio
}

export interface AudioMemo {
  url: string;
  duration: string;
  transcript?: string;
}

export interface MemoVersion {
  versionId: string;
  versionNumber: number;
  content: string;
  category: string;
  tags: string[];
  color?: string;
  updatedAt: string;
  changeSummary?: string;
}

export interface CustomGraphLink {
  id: string;
  sourceId: string; // e.g. 'memo-1', 'nb-1', 'page-101'
  targetId: string; // e.g. 'memo-2', 'nb-2', 'page-[id]'
  sourceType: 'memo' | 'notebook' | 'page';
  targetType: 'memo' | 'notebook' | 'page';
  relation: string;
  createdAt?: string;
}

export interface Memo {
  id: string;
  content: string;
  tags: string[];
  category: string;
  visibility: 'public' | 'private' | 'workspace';
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string; // ISO date
  updatedAt: string;
  color?: string; // Memo card theme color: 'neutral' | 'amber' | 'indigo' | 'emerald' | 'rose' | 'purple'
  dueDate?: string; // Optional reminder date
  attachments?: MemoAttachment[];
  audioMemo?: AudioMemo;
  reactions: {
    likes: number;
    bookmarks: number;
  };
  aiSummary?: string;
  versions?: MemoVersion[];
  linkedNotebookIds?: string[];
  linkedMemoIds?: string[];
  linkedPageIds?: string[];
}

export interface NotebookSource {
  id: string;
  title: string;
  type: 'pdf' | 'web' | 'audio' | 'text' | 'file';
  url?: string;
  contentSnippet: string;
  addedAt: string;
}

export interface NotebookPage {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sources?: string[]; // IDs of sources
  attachments?: MemoAttachment[];
  createdAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  linkedMemoIds?: string[];
  linkedNotebookIds?: string[];
}

export interface NotebookSynthesis {
  id: string;
  type: 'summary' | 'qa' | 'study_guide' | 'podcast' | 'faq';
  title: string;
  content: string;
  audioScript?: string;
  createdAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  category: string;
  coverColor: string; // Tailwind color class or hex
  icon: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  pages: NotebookPage[];
  sources: NotebookSource[];
  syntheses: NotebookSynthesis[];
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'memo' | 'notebook' | 'page' | 'tag' | 'category' | 'source';
  color: string;
  val: number;
  data?: any;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  strength?: number;
}
