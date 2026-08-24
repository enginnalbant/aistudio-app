import React from 'react';
import { 
  Folder, 
  Share2, 
  User, 
  Sparkles, 
  Plus, 
  Type, 
  Code2, 
  Image as ImageIcon, 
  Send 
} from 'lucide-react';
import { NoteItem } from '../KnowledgeWorkspace';

interface NotesStreamTabProps {
  currentNote: NoteItem;
  editingNoteTitle: string;
  editingNoteContent: string;
  aiPromptInput: string;
  setAiPromptInput: (v: string) => void;
  onUpdateNoteContent: (title: string, body: string) => void;
  onSendAiPrompt: (promptText?: string) => void;
}

export const NotesStreamTab: React.FC<NotesStreamTabProps> = ({
  currentNote,
  editingNoteTitle,
  editingNoteContent,
  aiPromptInput,
  setAiPromptInput,
  onUpdateNoteContent,
  onSendAiPrompt
}) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl relative">
      <div className="border-b border-white/10 pb-4 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Folder size={14} className="text-amber-400" />
            <span>{currentNote.folder || 'Personal Knowledge'}</span>
            <span>/</span>
            <span className="text-white font-bold">{editingNoteTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{currentNote.updatedAt}</span>
            <Share2 size={14} className="hover:text-white cursor-pointer" />
          </div>
        </div>

        <input
          type="text"
          value={editingNoteTitle}
          onChange={(e) => onUpdateNoteContent(e.target.value, editingNoteContent)}
          className="w-full bg-transparent text-2xl md:text-3xl font-display font-black text-white tracking-tight border-b border-transparent focus:border-indigo-500/50 outline-none"
        />

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="text-indigo-400 font-bold flex items-center gap-1"><User size={13} /> Apex</span>
          <span>•</span>
          <span>{editingNoteContent.split(/\s+/).filter(Boolean).length} words</span>
          <span>•</span>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
            <Sparkles size={12} /> AI Enhanced
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Formatting Sidebar */}
        <div className="w-9 bg-slate-950/60 border border-white/10 rounded-2xl p-1.5 flex flex-col items-center gap-2 shrink-0 h-fit text-slate-400">
          <button className="p-1 hover:text-white hover:bg-white/10 rounded-lg" title="Add Block"><Plus size={15} /></button>
          <button className="p-1 hover:text-white hover:bg-white/10 rounded-lg" title="Text"><Type size={15} /></button>
          <button className="p-1 hover:text-white hover:bg-white/10 rounded-lg" title="Code"><Code2 size={15} /></button>
          <button className="p-1 hover:text-white hover:bg-white/10 rounded-lg" title="Image"><ImageIcon size={15} /></button>
        </div>

        {/* Note Body Textarea */}
        <div className="flex-1 space-y-4">
          <textarea
            value={editingNoteContent}
            onChange={(e) => onUpdateNoteContent(editingNoteTitle, e.target.value)}
            rows={14}
            className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed outline-none focus:border-indigo-500/50 resize-y font-sans"
          />
        </div>
      </div>

      {/* Bottom Contextual AI Bar */}
      <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-3 space-y-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          <input
            type="text"
            value={aiPromptInput}
            onChange={(e) => setAiPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendAiPrompt()}
            placeholder="Ask AI anything or select text..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={() => onSendAiPrompt()}
            className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['Summarize', 'Rewrite', 'Translate', 'Explain', 'Create Tasks'].map((act, idx) => (
            <button
              key={idx}
              onClick={() => onSendAiPrompt(`${act} the current note.`)}
              className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              {act}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
