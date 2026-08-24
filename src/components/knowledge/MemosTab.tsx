import React, { useState } from 'react';
import { MessageSquare, Heart, Plus, Trash2 } from 'lucide-react';
import { MemoItem } from '../KnowledgeWorkspace';

interface MemosTabProps {
  memos: MemoItem[];
  setMemos: (memos: MemoItem[] | ((prev: MemoItem[]) => MemoItem[])) => void;
}

export const MemosTab: React.FC<MemosTabProps> = ({
  memos,
  setMemos
}) => {
  const [newContent, setNewContent] = useState('');

  const handleAddMemo = () => {
    if (!newContent.trim()) return;
    const memo: MemoItem = {
      id: `memo-${Date.now()}`,
      author: 'Apex User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: newContent.trim(),
      timestamp: 'Just now',
      likes: 0
    };
    setMemos(prev => [memo, ...prev]);
    setNewContent('');
  };

  const handleLike = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m));
  };

  const handleDelete = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-indigo-400" /> Quick Micro-Memos Stream
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMemo()}
            placeholder="Post a quick micro thought or reflection..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
          />
          <button 
            onClick={handleAddMemo}
            disabled={!newContent.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-2xl cursor-pointer transition-all flex items-center gap-1 shrink-0"
          >
            <Plus size={14} /> Post
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {memos.map(m => (
            <div key={m.id} className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-2 group shadow-md">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <img src={m.avatar} alt={m.author} className="w-5 h-5 rounded-full object-cover" />
                  <span className="font-bold text-white">{m.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[10px]">{m.timestamp}</span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{m.content}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleLike(m.id)}
                  className="text-[11px] text-slate-400 hover:text-pink-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Heart size={12} className={m.likes > 0 ? "fill-pink-500 text-pink-500" : ""} />
                  <span>{m.likes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
