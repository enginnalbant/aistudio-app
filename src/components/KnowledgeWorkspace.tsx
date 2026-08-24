import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UiButton, UiCard, UiBadge, UiInput, tokens } from './ui';
import { 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderPlus, 
  FileText, 
  BookOpen, 
  Book, 
  Bookmark, 
  Rss, 
  Radio, 
  Calendar, 
  CheckSquare, 
  Film, 
  Play, 
  Pause, 
  Lock, 
  Globe, 
  Trash2, 
  Settings, 
  User, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Activity, 
  Cpu, 
  Layers, 
  GitBranch, 
  Network, 
  Terminal, 
  Wand2, 
  Layout, 
  Share2, 
  Eye, 
  EyeOff,
  Download, 
  RefreshCw, 
  MoreVertical, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Coins, 
  Wallet, 
  Send, 
  Mic, 
  Paperclip, 
  Maximize2, 
  Minimize2, 
  Filter, 
  Hash, 
  Heart, 
  MessageSquare, 
  Compass, 
  Code2, 
  Image as ImageIcon, 
  FileCode, 
  ListCheck, 
  Zap, 
  BarChart3, 
  PieChart, 
  Bell, 
  Sun, 
  Moon, 
  HelpCircle, 
  PanelLeftClose, 
  PanelLeftOpen, 
  SlidersHorizontal,
  FileUp,
  Music,
  ExternalLink,
  Layers3,
  Bot,
  Copy,
  Check,
  Key,
  Volume2,
  MousePointer,
  Square,
  Type
} from 'lucide-react';

import { HomeDashboardTab } from './knowledge/HomeDashboardTab';
import { NotesStreamTab } from './knowledge/NotesStreamTab';
import { DeepResearchTab } from './knowledge/DeepResearchTab';
import { RssReaderTab } from './knowledge/RssReaderTab';
import { BookmarksTab } from './knowledge/BookmarksTab';
import { PlannerTab } from './knowledge/PlannerTab';
import { LibraryTab } from './knowledge/LibraryTab';
import { MediaStudioTab } from './knowledge/MediaStudioTab';
import { FilesVaultTab } from './knowledge/FilesVaultTab';
import { PasswordVaultTab } from './knowledge/PasswordVaultTab';
import { TranslatorTab } from './knowledge/TranslatorTab';
import { WhiteboardTab } from './knowledge/WhiteboardTab';
import { MemosTab } from './knowledge/MemosTab';
// --- TYPES ---
export interface NoteItem {
  id: string;
  title: string;
  snippet: string;
  content?: string;
  updatedAt: string;
  tags: string[];
  type?: 'note' | 'pdf' | 'image';
  pageCount?: number;
  imageCount?: number;
  starred?: boolean;
  folder?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Books' | 'RSS' | 'Media' | 'Files';
  progress?: string;
  icon: React.ReactNode;
  time: string;
}

export interface MemoItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
}

export interface RssArticle {
  id: string;
  feed: string;
  title: string;
  summary: string;
  content: string;
  published: string;
  starred: boolean;
  url: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  status: 'Reading' | 'Completed' | 'Wishlist';
  highlights: string[];
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  type: 'podcast' | 'audio' | 'video';
  transcript: string;
  cover: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  updated: string;
  folder: string;
  iconName: string;
}

export interface VaultCredential {
  id: string;
  service: string;
  username: string;
  secret: string;
  category: 'Login' | 'API Key' | 'Secure Note' | 'SSH Key';
  updatedAt: string;
}

export const KnowledgeWorkspace: React.FC = () => {
  // --- NAVIGATION STATE ---
  const [selectedModule, setSelectedModule] = useState<
    'home' | 'notes' | 'research' | 'rss' | 'bookmarks' | 'planner' | 'library' | 'media' | 'files' | 'password' | 'translate' | 'whiteboard' | 'memos'
  >('home');
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [tabsList, setTabsList] = useState([
    { id: 'home', label: 'Home Dashboard' },
    { id: 'notes', label: 'Notes Stream' },
    { id: 'research', label: 'Deep Research: AI Agents' },
    { id: 'rss', label: 'RSS Reader' },
    { id: 'bookmarks', label: 'Web Resources' },
    { id: 'planner', label: 'Planner & Calendar' }
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('Personal');

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');

  // Panels visibility
  const [showSecondaryNav, setShowSecondaryNav] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showActivityRail, setShowActivityRail] = useState(true);

  // Quick Capture
  const [quickCaptureText, setQuickCaptureText] = useState('');
  const [quickCaptureType, setQuickCaptureType] = useState<'note' | 'canvas' | 'bookmark' | 'import'>('note');

  // --- DATA STATES ---
  // 1. NOTES
  const [notesList, setNotesList] = useLocalStorage<NoteItem[]>('apex_workspace_notes', [
    {
      id: 'note-1',
      title: 'The Future of Personal Knowledge Systems',
      snippet: 'Modern knowledge systems are evolving from simple note-taking apps to intelligent, interconnected workspaces...',
      content: `Modern knowledge systems are evolving from simple note-taking apps to intelligent, interconnected workspaces. By combining the best of Open Notebook, AFFiNE, and Memos, we can create a unified knowledge ecosystem.

Key Principles:
1. Neural Context Engine - Vector retrieval across all thoughts.
2. Block-Based Architecture - Drag-and-drop structured content.
3. Universal Search - Single shortcut to query all personal data.
4. Local-First Sync - Cryptographically signed, private, and durable.`,
      updatedAt: 'Today 14:32',
      tags: ['#ai', '#research'],
      type: 'note',
      starred: true,
      folder: 'Personal Knowledge'
    },
    {
      id: 'note-2',
      title: 'Apex OS Roadmap & Architecture',
      snippet: 'Complete ecosystem plan for v4.2 release with neural context engines and local LLM integration.',
      content: `APEX OS Architecture Document:

Phase 1: Knowledge Core & High-density UI.
Phase 2: Local AI Model Runner with WebGPU.
Phase 3: Real-time Multi-agent Collaborative Canvas.
Phase 4: Encrypted Cloud Sync & Mobile Companion.`,
      updatedAt: 'Yesterday',
      tags: ['#roadmap', '#os'],
      type: 'note',
      folder: 'Projects'
    },
    {
      id: 'note-3',
      title: 'React 19 Notes & Compiler',
      snippet: 'New features, auto-memoization, server actions, and optimistic UI updates in React 19.',
      content: `React 19 Compiler automatically handles memoization without useMemo or useCallback. 

Key Server Actions:
- Form actions with useActionState
- Optimistic updates via useOptimistic
- Asset loading hooks for prefetching stylesheets and scripts.`,
      updatedAt: '2d ago',
      tags: ['#tech', '#react'],
      type: 'note',
      folder: 'AI & Tech'
    },
    {
      id: 'note-4',
      title: 'Book Review: Atomic Habits',
      snippet: 'Key takeaways and personal notes on identity-based habits and small continuous improvements.',
      content: `Atomic Habits by James Clear:

"You do not rise to the level of your goals. You fall to the level of your systems."

1. 1% Better Every Day = 37x better in a year.
2. Focus on identity rather than outcome.
3. Make habits Obvious, Attractive, Easy, and Satisfying.`,
      updatedAt: '3d ago',
      tags: ['#book'],
      type: 'note',
      folder: 'Books & Reading'
    }
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState('note-1');
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // 2. TODAY TASKS
  const [tasks, setTasks] = useLocalStorage<TaskItem[]>('apex_workspace_tasks', [
    { id: 't1', title: 'Read AI Agent paper & extract citations', completed: true, priority: 'High' },
    { id: 't2', title: 'Write Apex OS Knowledge Workspace specs', completed: false, priority: 'High' },
    { id: 't3', title: 'Review imported RSS feeds & bookmark links', completed: false, priority: 'Medium' },
    { id: 't4', title: 'Update Q3 personal productivity roadmap', completed: false, priority: 'Low' }
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // 3. RESEARCH STATE
  const [researchQuery, setResearchQuery] = useState('RAG & Vector Embeddings for Autonomous Agents');
  const [researchOutput, setResearchOutput] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // 4. RSS STATE
  const [selectedFeed, setSelectedFeed] = useState('TechCrunch');
  const [rssArticles, setRssArticles] = useLocalStorage<RssArticle[]>('apex_workspace_rss', [
    {
      id: 'rss-1',
      feed: 'TechCrunch',
      title: 'AI Native Operating Systems Are Transforming Workspace Productivity',
      summary: 'Next generation personal OS platforms are blurring the line between local files, notes, and cloud APIs.',
      content: 'Personal OS architectures leverage unified memory graphs, vector indexes, and instant keyboard shortcuts to create zero-friction workflows for knowledge workers.',
      published: '20 mins ago',
      starred: false,
      url: 'https://techcrunch.com'
    },
    {
      id: 'rss-2',
      feed: 'Hacker News',
      title: 'Show HN: Apex OS – High performance neural workspace in React',
      summary: 'A fast, sleek bento-style second brain built with TypeScript, Tailwind, and local vector storage.',
      content: ' Apex OS combines block note editing, deep research synthesis, RSS aggregation, and encrypted password management into a single browser application.',
      published: '1 hour ago',
      starred: true,
      url: 'https://news.ycombinator.com'
    },
    {
      id: 'rss-3',
      feed: 'MIT Tech Review',
      title: 'The Breakthrough in Autonomous Reasoning Agents',
      summary: 'New multi-step reasoning models demonstrate unprecedented precision in complex problem solving.',
      content: 'Researchers have demonstrated that combining tree search with self-correction prompts dramatically reduces hallucinations in long-form generation.',
      published: '3 hours ago',
      starred: false,
      url: 'https://technologyreview.com'
    }
  ]);
  const [activeArticleId, setActiveArticleId] = useState('rss-1');

  // 5. BOOKMARKS STATE
  const [bookmarkCategory, setBookmarkCategory] = useState('All');
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkItem[]>('apex_workspace_bookmarks', [
    {
      id: 'bm-1',
      title: 'Vercel AI SDK Docs',
      url: 'https://sdk.vercel.ai',
      category: 'AI Tools',
      description: 'Build AI-powered applications with React, Next.js, and streaming UI components.',
      icon: '⚡',
      tags: ['#ai', '#react', '#sdk']
    },
    {
      id: 'bm-2',
      title: 'Tailwind CSS v4 Documentation',
      url: 'https://tailwindcss.com',
      category: 'Dev Docs',
      description: 'Ultra-fast CSS engine with standalone executable and high performance utility classes.',
      icon: '🎨',
      tags: ['#css', '#design', '#frontend']
    },
    {
      id: 'bm-3',
      title: 'Lucide React Icons Collection',
      url: 'https://lucide.dev',
      category: 'Design Systems',
      description: 'Beautiful & consistent icon toolkit for modern UI design.',
      icon: '✨',
      tags: ['#icons', '#design']
    }
  ]);
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');

  // 6. PLANNER STATE
  const [selectedDate, setSelectedDate] = useState('2026-08-10');

  // 7. LIBRARY STATE
  const [books, setBooks] = useLocalStorage<BookItem[]>('apex_workspace_books', [
    {
      id: 'b-1',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      progress: 72,
      status: 'Reading',
      highlights: [
        'Reliability, scalability, and maintainability are the three core pillars.',
        'Event sourcing decoupled storage from computation.'
      ]
    },
    {
      id: 'b-2',
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      progress: 100,
      status: 'Completed',
      highlights: [
        'You do not rise to the level of your goals, you fall to the level of your systems.'
      ]
    }
  ]);

  // 8. MEDIA STATE
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [mediaTracks] = useState<MediaTrack[]>([
    {
      id: 'm-1',
      title: 'Episode 42: The Future of Autonomous AI Workspaces',
      artist: 'Apex Tech Podcast',
      duration: '42:18',
      type: 'podcast',
      transcript: 'Welcome back! Today we discuss how AI agents integrate into personal operating systems to automate daily research...',
      cover: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'm-2',
      title: 'Deep Focus Ambient Synthesis',
      artist: 'Apex Audio Engine',
      duration: '60:00',
      type: 'audio',
      transcript: '[Ambient Binaural Beats - 432Hz Focus Wave]',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [activeMediaId, setActiveMediaId] = useState('m-1');

  // 9. FILES STATE
  const [files, setFiles] = useLocalStorage<FileItem[]>('apex_workspace_files', [
    { id: 'f-1', name: 'research-paper-v4.pdf', size: '12.4 MB', type: 'PDF', updated: 'Today', folder: 'Research Papers', iconName: 'FileText' },
    { id: 'f-2', name: 'apex-os-architecture.drawio', size: '2.1 MB', type: 'Diagram', updated: 'Yesterday', folder: 'Documents', iconName: 'Layers' },
    { id: 'f-3', name: 'workspace-wallpaper.jpg', size: '4.8 MB', type: 'Image', updated: '3d ago', folder: 'Media', iconName: 'ImageIcon' }
  ]);

  // 10. VAULT STATE
  const [vaultUnlocked, setVaultUnlocked] = useState(true);
  const [vaultPinInput, setVaultPinInput] = useState('');
  const [maskedSecrets, setMaskedSecrets] = useState<Record<string, boolean>>({
    'v-1': true,
    'v-2': true,
    'v-3': true
  });
  const [copiedVaultId, setCopiedVaultId] = useState<string | null>(null);
  const [credentials, setCredentials] = useLocalStorage<VaultCredential[]>('apex_workspace_vault', [
    { id: 'v-1', service: 'Google Cloud API Key', username: 'apex-prod-service-account', secret: 'AIzaSyD-8x92aK_ApexKey9021', category: 'API Key', updatedAt: 'Today' },
    { id: 'v-2', service: 'GitHub Personal Access Token', username: 'apex-developer', secret: 'ghp_ApexOsToken9823412093814', category: 'Login', updatedAt: '2d ago' },
    { id: 'v-3', service: 'PostgreSQL Primary DB', username: 'postgres_admin', secret: 'P@ssw0rd_ApexOS_Secure2026', category: 'Secure Note', updatedAt: '1w ago' }
  ]);

  // 11. TRANSLATE STATE
  const [sourceLang, setSourceLang] = useState('tr');
  const [targetLang, setTargetLang] = useState('en');
  const [translateSource, setTranslateSource] = useState('Apex OS, bilginizi anında organize eden akıllı çalışma alanıdır.');
  const [translateTarget, setTranslateTarget] = useState('Apex OS is the intelligent workspace that instantly organizes your knowledge.');
  const [isTranslating, setIsTranslating] = useState(false);

  // 12. WHITEBOARD STATE
  const [whiteboardNodes, setWhiteboardNodes] = useState([
    { id: 'w1', title: 'Knowledge Core', x: 100, y: 100, color: 'bg-indigo-600/30 border-indigo-400' },
    { id: 'w2', title: 'AI Copilot', x: 320, y: 80, color: 'bg-purple-600/30 border-purple-400' },
    { id: 'w3', title: 'Vector Store', x: 200, y: 260, color: 'bg-cyan-600/30 border-cyan-400' }
  ]);

  // 13. MEMOS STATE
  const [memos, setMemos] = useLocalStorage<MemoItem[]>('apex_workspace_memos', [
    {
      id: 'm1',
      author: 'Apex User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: 'Quick thought: Combining block notes with vector memory creates an instant zero-friction second brain.',
      timestamp: 'Just now',
      likes: 2
    },
    {
      id: 'm2',
      author: 'Apex User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: 'Reading Atomic Habits... "Systems are more important than goals."',
      timestamp: '2h ago',
      likes: 5
    }
  ]);
    {
      id: 'm2',
      author: 'Apex User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: 'Reading Atomic Habits... "Systems are more important than goals."',
      timestamp: '2h ago',
      likes: 5
    }
  ]);
  const [newMemoInput, setNewMemoInput] = useState('');

  // AI Assistant Right Panel State
  const [aiTab, setAiTab] = useState<'copilot' | 'graph' | 'properties'>('copilot');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      id: '1',
      sender: 'user',
      text: 'Summarize the key points of this note and suggest related resources.'
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Here\'s a summary and suggestions based on your workspace:',
      summaryPoints: [
        'Modern knowledge systems integrate notes, sources, and AI',
        'Block editing enables powerful structured layout',
        'Graph connections create contextual memory'
      ],
      relatedResources: [
        { title: 'Building a Second Brain', author: 'Tiago Forte', tag: 'Book' },
        { title: 'Apex OS Architecture', author: 'System Docs', tag: 'Guide' }
      ]
    }
  ]);

  // Activity Feed
  const [activityCategory, setActivityCategory] = useState<'All' | 'Books' | 'RSS' | 'Media'>('All');
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'a1',
      title: 'New RSS Article',
      subtitle: 'OpenAI releases new reasoning model...',
      category: 'RSS',
      icon: <Rss size={14} className="text-amber-400" />,
      time: '10m ago'
    },
    {
      id: 'a2',
      title: 'Book Progress',
      subtitle: 'Designing Data-Intensive Applications • 72%',
      category: 'Books',
      progress: '72%',
      icon: <BookOpen size={14} className="text-cyan-400" />,
      time: '1h ago'
    },
    {
      id: 'a3',
      title: 'Audio Podcast',
      subtitle: 'Episode 42: Autonomous AI Workspaces',
      category: 'Media',
      icon: <Film size={14} className="text-pink-400" />,
      time: '3h ago'
    }
  ]);

  // Sync selected note editing fields
  const currentNote = notesList.find(n => n.id === selectedNoteId) || notesList[0];
  useEffect(() => {
    if (currentNote) {
      setEditingNoteTitle(currentNote.title);
      setEditingNoteContent(currentNote.content || currentNote.snippet);
    }
  }, [selectedNoteId]);

  // Keyboard shortcut listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- HANDLERS ---
  const handleSelectModule = (mod: typeof selectedModule) => {
    setSelectedModule(mod);
    // Find or add matching tab
    const labelMap: Record<string, string> = {
      home: 'Home Dashboard',
      notes: 'Notes Stream',
      research: 'Deep Research',
      rss: 'RSS Reader',
      bookmarks: 'Web Resources',
      planner: 'Planner & Calendar',
      library: 'Digital Library',
      media: 'Media Studio',
      files: 'File Vault',
      password: 'Encrypted Vault',
      translate: 'AI Translator',
      whiteboard: 'Whiteboard',
      memos: 'Memos Timeline'
    };
    const tabId = mod;
    if (!tabsList.some(t => t.id === tabId)) {
      setTabsList(prev => [...prev, { id: tabId, label: labelMap[mod] || mod }]);
    }
    setActiveTab(tabId);
  };

  const handleUpdateNoteContent = (newTitle: string, newBody: string) => {
    setEditingNoteTitle(newTitle);
    setEditingNoteContent(newBody);
    setNotesList(prev => prev.map(n => n.id === selectedNoteId ? {
      ...n,
      title: newTitle,
      content: newBody,
      snippet: newBody.slice(0, 100) + '...',
      updatedAt: 'Just now'
    } : n));
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskInput, completed: false, priority: 'Medium' }]);
    setNewTaskInput('');
  };

  const handleAddQuickCapture = () => {
    if (!quickCaptureText.trim()) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: quickCaptureText.slice(0, 30) + (quickCaptureText.length > 30 ? '...' : ''),
      snippet: quickCaptureText,
      content: quickCaptureText,
      updatedAt: 'Just now',
      tags: ['#quick', `#${quickCaptureType}`],
      type: 'note'
    };
    setNotesList([newNote, ...notesList]);
    setSelectedNoteId(newNote.id);
    setSelectedModule('notes');
    setQuickCaptureText('');
  };

  const handleSendAiPrompt = (promptText?: string) => {
    const textToSend = promptText || aiPromptInput;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setAiChatHistory(prev => [...prev, userMsg]);
    if (!promptText) setAiPromptInput('');

    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Analysis for "${textToSend}":`,
        summaryPoints: [
          'Unified knowledge system allows instant vector query matching',
          'Contextual AI embeddings link notes, RSS feeds, and book highlights',
          'Bi-directional graph links ensure zero lost thoughts'
        ],
        relatedResources: [
          { title: 'Vector Knowledge Graphs', author: 'AI Research', tag: 'Paper' },
          { title: 'Apex OS Architecture', author: 'Docs', tag: 'Guide' }
        ]
      };
      setAiChatHistory(prev => [...prev, aiMsg]);
    }, 600);
  };

  const handleAddMemo = () => {
    if (!newMemoInput.trim()) return;
    const memo: MemoItem = {
      id: Date.now().toString(),
      author: 'Apex User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: newMemoInput,
      timestamp: 'Just now',
      likes: 0
    };
    setMemos([memo, ...memos]);
    setNewMemoInput('');
  };

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      if (sourceLang === 'tr' && targetLang === 'en') {
        setTranslateTarget('Apex OS is the intelligent workspace that instantly organizes your knowledge and connects all your thoughts seamlessly.');
      } else if (sourceLang === 'en' && targetLang === 'tr') {
        setTranslateTarget('Apex OS, bilgilerinizi anında organize eden ve tüm düşüncelerinizi kesintisiz bağlayan akıllı çalışma alanıdır.');
      } else {
        setTranslateTarget(`[AI Translation Output (${targetLang.toUpperCase()})]: ${translateSource}`);
      }
      setIsTranslating(false);
    }, 500);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabsList.length <= 1) return;
    const nextTabs = tabsList.filter(t => t.id !== id);
    setTabsList(nextTabs);
    if (activeTab === id) {
      const fallback = nextTabs[0].id as any;
      setActiveTab(fallback);
      setSelectedModule(fallback as any);
    }
  };

  const copyCredential = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVaultId(id);
    setTimeout(() => setCopiedVaultId(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#070a12] text-slate-100 font-sans overflow-hidden select-none relative">
      
      {/* ==========================================
          1. GLOBAL TOP COMMAND & HEADER BAR
         ========================================== */}
      <header className="h-12 border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-2xl px-3 flex items-center justify-between shrink-0 z-50">
        
        {/* Left: Branding & Navigation toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[7px] flex items-center justify-center">
                <Zap size={15} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
              </div>
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
              Apex <span className="text-indigo-400">OS</span>
            </span>
          </div>

          <button 
            onClick={() => setShowSecondaryNav(!showSecondaryNav)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-white/10"
            title="Toggle Contextual Sidebar"
          >
            {showSecondaryNav ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-xl mx-4">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full h-8 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-indigo-500/40 rounded-xl px-3 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <span>Command Palette...</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono bg-white/10 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Quick Tools, AI Status & Profile */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button 
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                showAiPanel ? 'bg-indigo-600/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot size={13} />
              <span>AI</span>
            </button>
            <button 
              onClick={() => setAiTab('graph')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Network size={13} />
              <span>Graph</span>
            </button>
            <button 
              className="px-2 py-1 rounded-lg font-medium text-slate-400 hover:text-white transition-all flex items-center gap-1"
              title="Cloud Sync Active"
            >
              <RefreshCw size={12} className="animate-spin text-emerald-400" />
              <span className="text-[10px]">Sync</span>
            </button>
          </div>

          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all relative">
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 border border-white/20 p-0.5 flex items-center justify-center cursor-pointer shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="User Avatar" 
              className="w-full h-full rounded-[10px] object-cover"
            />
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN BODY LAYOUT (MULTI-COLUMN DESKTOP WORKSPACE)
         ========================================== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ------------------------------------------
            REGION 1: GLOBAL SIDEBAR (NARROW RAIL ~64px)
           ------------------------------------------ */}
        <aside className="w-16 bg-[#080b14] border-r border-white/10 flex flex-col justify-between items-center py-3 shrink-0 z-30">
          <div className="flex flex-col items-center gap-2 w-full px-2">
            {[
              { id: 'home', icon: Layout, label: 'Home Dashboard' },
              { id: 'notes', icon: FileText, label: 'Notes Stream' },
              { id: 'research', icon: Compass, label: 'Deep Research' },
              { id: 'rss', icon: Rss, label: 'RSS Reader', badge: '3' },
              { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
              { id: 'planner', icon: Calendar, label: 'Planner & Calendar' },
              { id: 'library', icon: BookOpen, label: 'Digital Library' },
              { id: 'media', icon: Film, label: 'Media Studio' },
              { id: 'files', icon: Folder, label: 'Cloud Files' },
              { id: 'password', icon: Lock, label: 'Encrypted Vault' },
              { id: 'translate', icon: Globe, label: 'Neural Translator' },
              { id: 'whiteboard', icon: Layers, label: 'Whiteboard Canvas' },
              { id: 'memos', icon: MessageSquare, label: 'Micro Memos' }
            ].map(item => {
              const IconComp = item.icon;
              const isSelected = selectedModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id as any)}
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                    isSelected 
                      ? 'bg-gradient-to-b from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <IconComp size={18} />
                  {item.badge && (
                    <span className="absolute top-1 right-1 text-[9px] font-bold bg-indigo-500 text-white px-1 rounded-full border border-black">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute left-16 bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-white/10">
            <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
              <Settings size={16} />
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Apex AI Online" />
          </div>
        </aside>

        {/* ------------------------------------------
            REGION 2: SECONDARY NAVIGATION PANEL (~280px)
           ------------------------------------------ */}
        <AnimatePresence>
          {showSecondaryNav && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0b0f1c]/95 border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-20 backdrop-blur-xl"
            >
              <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="font-display font-extrabold text-sm text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">
                    {selectedModule} Workspace
                  </span>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-white" />
                </div>
                <button 
                  onClick={() => {
                    handleSelectModule('notes');
                    const newN: NoteItem = {
                      id: `note-${Date.now()}`,
                      title: 'Yeni Taslak Not',
                      snippet: 'İçerik buraya gelecek...',
                      content: 'Taslak not içeriği...',
                      updatedAt: 'Just now',
                      tags: ['#draft'],
                      type: 'note'
                    };
                    setNotesList([newN, ...notesList]);
                    setSelectedNoteId(newN.id);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New</span>
                </button>
              </div>

              {/* Quick Capture Box */}
              <div className="p-3 space-y-3">
                <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-3 space-y-2.5 shadow-lg">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
                      <Zap size={13} /> Quick Capture
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">Ctrl N</span>
                  </div>

                  <textarea
                    value={quickCaptureText}
                    onChange={(e) => setQuickCaptureText(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={2}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 resize-none"
                  />

                  <div className="flex justify-between items-center gap-1">
                    {(['note', 'canvas', 'bookmark', 'import'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setQuickCaptureType(type)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                          quickCaptureType === type 
                            ? 'bg-indigo-600/80 text-white shadow-sm' 
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {quickCaptureText.trim() && (
                    <button 
                      onClick={handleAddQuickCapture}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Capture Item
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Categories Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-4 pb-6 text-xs">
                
                {/* Views & Categories */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block px-1">WORKSPACE MODULES</span>
                  {[
                    { label: 'Home Dashboard', mod: 'home', icon: Layout },
                    { label: 'Notes Stream', mod: 'notes', icon: FileText, count: notesList.length.toString() },
                    { label: 'Deep Research', mod: 'research', icon: Compass },
                    { label: 'RSS Reader', mod: 'rss', icon: Rss, count: rssArticles.length.toString() },
                    { label: 'Bookmarks', mod: 'bookmarks', icon: Bookmark, count: bookmarks.length.toString() },
                    { label: 'Planner & Calendar', mod: 'planner', icon: Calendar },
                    { label: 'Digital Library', mod: 'library', icon: BookOpen, count: books.length.toString() },
                    { label: 'Media Studio', mod: 'media', icon: Film },
                    { label: 'Cloud Files', mod: 'files', icon: Folder, count: files.length.toString() },
                    { label: 'Encrypted Vault', mod: 'password', icon: Lock },
                    { label: 'AI Translator', mod: 'translate', icon: Globe },
                    { label: 'Whiteboard', mod: 'whiteboard', icon: Layers },
                    { label: 'Memos Stream', mod: 'memos', icon: MessageSquare, count: memos.length.toString() }
                  ].map((item, idx) => {
                    const IconC = item.icon;
                    const isActive = selectedModule === item.mod;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleSelectModule(item.mod as any)}
                        className={`flex justify-between items-center px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                          isActive ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconC size={14} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.count && <span className="text-[10px] font-mono font-bold bg-white/10 text-slate-300 px-1.5 py-0.2 rounded-full">{item.count}</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block px-1">TAG FILTERS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['#ai', '#research', '#design', '#book', '#tech', '#os'].map((tg, tidx) => (
                      <span 
                        key={tidx}
                        onClick={() => {
                          handleSelectModule('notes');
                          setNotesSearchQuery(tg);
                        }}
                        className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------
            REGION 3: SECONDARY STREAM STREAM LIST (Notes, RSS, Bookmarks, Files etc.)
           ------------------------------------------ */}
        <div className="w-64 bg-[#080c18]/90 border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-10">
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              {selectedModule === 'notes' ? 'Note Stream' :
               selectedModule === 'rss' ? 'RSS Articles' :
               selectedModule === 'bookmarks' ? 'Saved Links' :
               selectedModule === 'files' ? 'Files' :
               selectedModule === 'password' ? 'Vault Keys' :
               selectedModule === 'library' ? 'Books Shelf' : 'Context Stream'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {selectedModule === 'notes' ? notesList.length :
               selectedModule === 'rss' ? rssArticles.length :
               selectedModule === 'bookmarks' ? bookmarks.length :
               selectedModule === 'files' ? files.length :
               selectedModule === 'password' ? credentials.length :
               selectedModule === 'library' ? books.length : 'Active'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {selectedModule === 'notes' && notesList
              .filter(n => n.title.toLowerCase().includes(notesSearchQuery.toLowerCase()))
              .map(note => (
                <UiCard
                  key={note.id}
                  title={note.title}
                  snippet={note.snippet}
                  selected={selectedNoteId === note.id}
                  starred={note.starred}
                  updatedAt={note.updatedAt}
                  tags={note.tags}
                  icon={FileText}
                  onClick={() => setSelectedNoteId(note.id)}
                />
              ))}

            {selectedModule === 'rss' && rssArticles.map(art => (
              <UiCard
                key={art.id}
                title={art.title}
                subtitle={art.feed}
                selected={activeArticleId === art.id}
                starred={art.starred}
                updatedAt={art.published}
                icon={Rss}
                onClick={() => setActiveArticleId(art.id)}
              />
            ))}

            {selectedModule === 'bookmarks' && bookmarks.map(bm => (
              <UiCard
                key={bm.id}
                title={bm.title}
                snippet={bm.description}
                badge={bm.category}
                badgeVariant="indigo"
                tags={bm.tags}
                icon={Bookmark}
              />
            ))}

            {selectedModule === 'files' && files.map(f => (
              <UiCard
                key={f.id}
                title={f.name}
                subtitle={f.folder}
                badge={f.size}
                badgeVariant="cyan"
                updatedAt={f.updated}
                icon={Folder}
              />
            ))}

            {selectedModule === 'password' && credentials.map(c => (
              <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-white block">{c.service}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{c.username}</span>
              </div>
            ))}

            {selectedModule === 'library' && books.map(b => (
              <div key={b.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-white block">{b.title}</span>
                <span className="text-[10px] text-slate-400 block">{b.author}</span>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${b.progress}%` }} />
                </div>
              </div>
            ))}

            {selectedModule !== 'notes' && selectedModule !== 'rss' && selectedModule !== 'bookmarks' && selectedModule !== 'files' && selectedModule !== 'password' && selectedModule !== 'library' && (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                Active Module: {selectedModule.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------
            REGION 4: MAIN WORKSPACE (DYNAMIC PAGES RENDERER)
           ------------------------------------------ */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#090d19] relative overflow-hidden">
          
          {/* Workspace Tabs Header */}
          <div className="h-10 bg-[#0a0e1c] border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto scrollbar-none shrink-0">
            {tabsList.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (['home', 'notes', 'research', 'rss', 'bookmarks', 'planner', 'library', 'media', 'files', 'password', 'translate', 'whiteboard', 'memos'].includes(tab.id)) {
                      setSelectedModule(tab.id as any);
                    }
                  }}
                  className={`h-8 px-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive 
                      ? 'bg-slate-900 text-white border-white/15 shadow-md' 
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FileText size={13} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  <button 
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
            <button 
              onClick={() => {
                const newT = { id: `tab-${Date.now()}`, label: 'New Workspace Tab' };
                setTabsList([...tabsList, newT]);
                setActiveTab(newT.id);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Dynamic Content Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* 1. HOME DASHBOARD PAGE */}
            {selectedModule === 'home' && (
              <HomeDashboardTab
                notesList={notesList}
                bookmarks={bookmarks}
                rssArticles={rssArticles}
                books={books}
                files={files}
                tasks={tasks}
                newTaskInput={newTaskInput}
                setNewTaskInput={setNewTaskInput}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onSelectModule={handleSelectModule}
              />
            )}

            {/* 2. NOTES STREAM & EDITOR PAGE */}
            {selectedModule === 'notes' && (
              <NotesStreamTab
                currentNote={currentNote}
                editingNoteTitle={editingNoteTitle}
                editingNoteContent={editingNoteContent}
                aiPromptInput={aiPromptInput}
                setAiPromptInput={setAiPromptInput}
                onUpdateNoteContent={handleUpdateNoteContent}
                onSendAiPrompt={handleSendAiPrompt}
              />
            )}

            {/* 3. DEEP RESEARCH PAGE */}
            {selectedModule === 'research' && (
              <DeepResearchTab
                researchQuery={researchQuery}
                setResearchQuery={setResearchQuery}
                researchOutput={researchOutput}
                isSynthesizing={isSynthesizing}
                onSynthesize={() => {
                  setIsSynthesizing(true);
                  setTimeout(() => {
                    setResearchOutput(`Deep Synthesis for "${researchQuery}":\n\n1. Multi-agent Orchestration: Modular frameworks permit specialized sub-agents to execute web queries, code execution, and data extraction.\n2. Vector Context Retrieval: Semantic graph databases reduce latency by 68% compared to traditional full-text searches.\n3. Citation Quality: Verified against 12 imported PDF papers and recent arXiv benchmarks.`);
                    setIsSynthesizing(false);
                  }, 800);
                }}
              />
            )}

            {/* 4. RSS READER PAGE */}
            {selectedModule === 'rss' && (
              <RssReaderTab
                rssArticles={rssArticles}
                selectedFeed={selectedFeed}
                setSelectedFeed={setSelectedFeed}
              />
            )}

            {/* 5. BOOKMARKS PAGE */}
            {selectedModule === 'bookmarks' && (
              <BookmarksTab
                bookmarks={bookmarks}
                setBookmarks={setBookmarks}
              />
            )}

            {/* 6. PLANNER PAGE */}
            {selectedModule === 'planner' && (
              <PlannerTab
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}

            {/* 7. LIBRARY PAGE */}
            {selectedModule === 'library' && (
              <LibraryTab
                books={books}
                setBooks={setBooks}
              />
            )}

            {/* 8. MEDIA STUDIO PAGE */}
            {selectedModule === 'media' && (
              <MediaStudioTab
                mediaTracks={mediaTracks}
                mediaPlaying={mediaPlaying}
                activeMediaId={activeMediaId}
                setActiveMediaId={setActiveMediaId}
                setMediaPlaying={setMediaPlaying}
              />
            )}

            {/* 9. CLOUD FILES PAGE */}
            {selectedModule === 'files' && (
              <FilesVaultTab
                files={files}
                setFiles={setFiles}
              />
            )}

            {/* 10. ENCRYPTED VAULT PAGE */}
            {selectedModule === 'password' && (
              <PasswordVaultTab
                credentials={credentials}
                setCredentials={setCredentials}
              />
            )}

            {/* 11. NEURAL TRANSLATOR PAGE */}
            {selectedModule === 'translate' && (
              <TranslatorTab
                sourceLang={sourceLang}
                setSourceLang={setSourceLang}
                targetLang={targetLang}
                setTargetLang={setTargetLang}
                translateSource={translateSource}
                setTranslateSource={setTranslateSource}
                translateTarget={translateTarget}
                isTranslating={isTranslating}
                onTranslate={handleTranslate}
              />
            )}

            {/* 12. WHITEBOARD CANVAS PAGE */}
            {selectedModule === 'whiteboard' && (
              <WhiteboardTab />
            )}

            {/* 13. MEMOS TIMELINE PAGE */}
            {selectedModule === 'memos' && (
              <MemosTab
                memos={memos}
                setMemos={setMemos}
              />
            )}

          </div>
        </div>

        {/* ------------------------------------------
            REGION 5: APEX AI ASSISTANT PANEL (~320px)
           ------------------------------------------ */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 330, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0a0d1b]/95 border-l border-white/10 flex flex-col shrink-0 overflow-hidden z-20 backdrop-blur-xl"
            >
              <div className="p-2 border-b border-white/10 flex items-center justify-between gap-1 bg-[#0c1022]">
                {[
                  { id: 'copilot', label: 'AI Copilot', icon: Bot },
                  { id: 'graph', label: 'Graph', icon: Network },
                  { id: 'properties', label: 'Properties', icon: SlidersHorizontal }
                ].map(t => {
                  const IconT = t.icon;
                  const isActive = aiTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setAiTab(t.id as any)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <IconT size={13} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {aiTab === 'copilot' && (
                <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto custom-scrollbar space-y-4">
                  <div className="text-center py-2 border-b border-white/10 space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 mx-auto flex items-center justify-center text-indigo-300 shadow-lg">
                      <Zap size={22} />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-white">Apex AI Copilot</h3>
                    <p className="text-[11px] text-slate-400">Intelligent Assistant Connected</p>
                  </div>

                  <div className="space-y-3">
                    {aiChatHistory.map(msg => (
                      <div key={msg.id} className="space-y-2">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/30 ml-4' 
                            : 'bg-slate-900/90 text-slate-200 border border-white/10 mr-2 space-y-2'
                        }`}>
                          <p>{msg.text}</p>

                          {msg.summaryPoints && (
                            <div className="space-y-1 pt-1">
                              <span className="font-bold text-indigo-400 block text-[11px]">Summary:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                                {msg.summaryPoints.map((pt, pidx) => (
                                  <li key={pidx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center px-1 pt-2 border-t border-white/10">
                    <span>Context Active</span>
                    <span className="text-indigo-400">v4.2.0</span>
                  </div>
                </div>
              )}

              {aiTab === 'graph' && (
                <div className="flex-1 p-3 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white">Graph Explorer</h4>
                    <p className="text-[11px] text-slate-400">1,280 bi-directional knowledge links active across workspace.</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-slate-950 border border-white/10 p-4 flex items-center justify-center text-slate-500 text-xs text-center">
                    Interactive Knowledge Graph Mode
                  </div>
                </div>
              )}

              {aiTab === 'properties' && (
                <div className="flex-1 p-3 space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-white">Workspace Properties</h4>
                  <div className="space-y-2 border-t border-white/10 pt-2 text-[11px]">
                    <div className="flex justify-between"><span>Selected Module:</span> <span className="text-indigo-400 font-bold">{selectedModule}</span></div>
                    <div className="flex justify-between"><span>Total Notes:</span> <span className="text-slate-400">{notesList.length}</span></div>
                    <div className="flex justify-between"><span>Security:</span> <span className="text-emerald-400 font-bold">Encrypted</span></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------
            REGION 6: FAR RIGHT ACTIVITY RAIL (~260px)
           ------------------------------------------ */}
        <AnimatePresence>
          {showActivityRail && (
            <aside className="w-64 bg-[#080b15]/95 border-l border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3 space-y-4 z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-indigo-400" /> Activity
                  </span>
                  <Settings size={13} className="text-slate-500 hover:text-white cursor-pointer" />
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
                  {(['All', 'Books', 'RSS', 'Media'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActivityCategory(cat)}
                      className={`flex-1 py-1 rounded-lg transition-all ${
                        activityCategory === cat 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {activities
                  .filter(a => activityCategory === 'All' || a.category === activityCategory)
                  .map(act => (
                    <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2">
                        {act.icon}
                        <span className="text-xs font-bold text-white">{act.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-5 line-clamp-1">{act.subtitle}</p>
                      <div className="flex justify-between items-center pl-5 text-[9px] font-mono text-slate-500">
                        <span>{act.time}</span>
                        {act.progress && <span className="text-indigo-400 font-bold">{act.progress}</span>}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">Memos Stream</span>
                  <button onClick={handleAddMemo} className="text-indigo-400 text-[10px] font-bold">+ Post</button>
                </div>
                {memos.map(m => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1 text-xs">
                    <span className="font-bold text-white block">{m.author}</span>
                    <p className="text-[11px] text-slate-300">{m.content}</p>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </AnimatePresence>

      </div>

      {/* ==========================================
          MODAL: COMMAND PALETTE (CTRL + K)
         ========================================== */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0c1020] border border-indigo-500/30 rounded-3xl p-4 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <Search size={18} className="text-indigo-400" />
                <input
                  type="text"
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a command or navigate..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button 
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar text-xs">
                {[
                  { label: 'Home Dashboard', desc: 'Overview, quick stats & focus tasks', mod: 'home', icon: Layout },
                  { label: 'Notes Stream', desc: 'Open block note editor', mod: 'notes', icon: FileText },
                  { label: 'Deep AI Research', desc: 'Search research papers & graph', mod: 'research', icon: Compass },
                  { label: 'RSS Reader', desc: 'Browse subscribed feeds', mod: 'rss', icon: Rss },
                  { label: 'Web Bookmarks', desc: 'View saved resources', mod: 'bookmarks', icon: Bookmark },
                  { label: 'Planner & Calendar', desc: 'Manage schedule and agenda', mod: 'planner', icon: Calendar },
                  { label: 'Digital Library', desc: 'Open books shelf', mod: 'library', icon: BookOpen },
                  { label: 'Media Studio', desc: 'Listen to podcasts & audio', mod: 'media', icon: Film },
                  { label: 'Cloud Files', desc: 'Manage uploaded files', mod: 'files', icon: Folder },
                  { label: 'Encrypted Vault', desc: 'Access saved passwords', mod: 'password', icon: Lock },
                  { label: 'AI Translator', mod: 'translate', desc: 'Multi-language neural translator', icon: Globe }
                ].map((cmd, idx) => {
                  const IconCmd = cmd.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSelectModule(cmd.mod as any);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-transparent transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <IconCmd size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{cmd.label}</span>
                          <span className="text-[11px] text-slate-400">{cmd.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-500 group-hover:text-white" />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[10px] text-slate-500 font-mono">
                <span>Navigation: ↑ ↓ Enter</span>
                <span>ESC to Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default KnowledgeWorkspace;
