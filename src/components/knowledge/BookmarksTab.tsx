import React, { useState } from 'react';
import { Bookmark, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { BookmarkItem } from '../KnowledgeWorkspace';

interface BookmarksTabProps {
  bookmarks: BookmarkItem[];
  setBookmarks: (bms: BookmarkItem[] | ((prev: BookmarkItem[]) => BookmarkItem[])) => void;
}

export const BookmarksTab: React.FC<BookmarksTabProps> = ({
  bookmarks,
  setBookmarks
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('AI Tools');

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const item: BookmarkItem = {
      id: `bm-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      category: newCategory,
      description: 'Saved resource link in Apex Knowledge Vault.',
      icon: '⚡',
      tags: ['#web', `#${newCategory.toLowerCase().replace(/\s+/g, '-')}`]
    };
    setBookmarks(prev => [item, ...prev]);
    setNewTitle('');
    setNewUrl('');
  };

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="text-cyan-400" /> Web Bookmarks Vault
          </h2>
          <span className="text-xs text-slate-400 font-mono">{bookmarks.length} Bookmarks Stored</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Resource Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            placeholder="URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="AI Tools">AI Tools</option>
            <option value="Dev Docs">Dev Docs</option>
            <option value="Design Systems">Design Systems</option>
            <option value="Research">Research</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim() || !newUrl.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bookmarks.map(bm => (
          <div key={bm.id} className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl space-y-2 shadow-lg group relative">
            <div className="flex justify-between items-center">
              <span className="text-xl">{bm.icon}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  {bm.category}
                </span>
                <button
                  onClick={() => handleDelete(bm.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold text-white">{bm.title}</h3>
            <p className="text-xs text-slate-400 leading-snug">{bm.description}</p>
            <a 
              href={bm.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-cyan-400 font-bold pt-1 hover:underline truncate flex items-center gap-1"
            >
              <span className="truncate">{bm.url}</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
