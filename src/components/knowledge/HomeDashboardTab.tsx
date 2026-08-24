import React from 'react';
import { 
  Zap, 
  FileText, 
  Bookmark, 
  Rss, 
  Book, 
  Folder, 
  Compass, 
  Calendar, 
  Globe, 
  ArrowUpRight, 
  CheckCircle2 
} from 'lucide-react';
import { NoteItem, TaskItem, BookmarkItem, RssArticle, BookItem, FileItem } from '../KnowledgeWorkspace';

interface HomeDashboardTabProps {
  notesList: NoteItem[];
  bookmarks: BookmarkItem[];
  rssArticles: RssArticle[];
  books: BookItem[];
  files: FileItem[];
  tasks: TaskItem[];
  newTaskInput: string;
  setNewTaskInput: (v: string) => void;
  onToggleTask: (id: string) => void;
  onAddTask: () => void;
  onSelectModule: (mod: string) => void;
}

export const HomeDashboardTab: React.FC<HomeDashboardTabProps> = ({
  notesList,
  bookmarks,
  rssArticles,
  books,
  files,
  tasks,
  newTaskInput,
  setNewTaskInput,
  onToggleTask,
  onAddTask,
  onSelectModule
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-500/20 p-6 shadow-2xl overflow-hidden flex items-center justify-between">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Zap size={18} />
            </div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
              Knowledge Hub & Second Brain
            </h2>
          </div>
          <p className="text-xs text-slate-300/80">
            Turn raw data into structured knowledge. Connected local-first storage active.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3 z-10">
          {[
            { label: 'Notes', count: notesList.length.toString(), icon: FileText, color: 'text-indigo-400' },
            { label: 'Bookmarks', count: bookmarks.length.toString(), icon: Bookmark, color: 'text-cyan-400' },
            { label: 'RSS Feeds', count: rssArticles.length.toString(), icon: Rss, color: 'text-amber-400' },
            { label: 'Books', count: books.length.toString(), icon: Book, color: 'text-pink-400' },
            { label: 'Files', count: files.length.toString(), icon: Folder, color: 'text-emerald-400' }
          ].map((st, idx) => {
            const IconS = st.icon;
            return (
              <div key={idx} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl flex flex-col items-center min-w-[70px]">
                <IconS size={15} className={`${st.color} mb-1`} />
                <span className="text-base font-mono font-black text-white">{st.count}</span>
                <span className="text-[9px] text-slate-400 font-bold">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launcher Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'notes', name: 'Notes Stream', desc: 'Rich block editor & notes', icon: FileText, color: 'from-indigo-600/30 to-purple-600/20' },
          { id: 'research', name: 'Deep Research', desc: 'AI citations & knowledge graph', icon: Compass, color: 'from-cyan-600/30 to-blue-600/20' },
          { id: 'planner', name: 'Planner & Calendar', desc: 'Schedule & time blocking', icon: Calendar, color: 'from-amber-600/30 to-rose-600/20' },
          { id: 'translate', name: 'AI Translator', desc: 'Neural translation engine', icon: Globe, color: 'from-emerald-600/30 to-teal-600/20' }
        ].map(m => {
          const IconM = m.icon;
          return (
            <div 
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} border border-white/10 hover:border-white/30 cursor-pointer transition-all space-y-2 group shadow-lg`}
            >
              <div className="flex justify-between items-center">
                <IconM size={20} className="text-white group-hover:scale-110 transition-transform" />
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">{m.name}</h3>
              <p className="text-[11px] text-slate-300/80">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Focus Checklist */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={15} className="text-indigo-400" /> Today Focus Checklist
          </span>
          <span className="text-[10px] font-mono text-indigo-400 font-bold">
            {tasks.filter(t => t.completed).length}/{tasks.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-slate-950/40 border-white/5 opacity-60 line-through text-slate-400' 
                  : 'bg-slate-800/40 border-white/10 hover:border-white/20 text-white'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                  task.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/20'
                }`}>
                  {task.completed && <CheckCircle2 size={12} />}
                </div>
                <span>{task.title}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {task.priority}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
            placeholder="Add a new focus task..."
            className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onAddTask}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
