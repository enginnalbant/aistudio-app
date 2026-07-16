import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookText, 
  FolderPlus, 
  FilePlus, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  Clock, 
  BookOpen,
  Maximize2,
  Minimize2,
  Save,
  Link2,
  Globe,
  ExternalLink,
  Bold,
  Italic,
  Heading,
  Code,
  List,
  Quote,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Notebook {
  id: string;
  title: string;
  color: 'amber' | 'rose' | 'emerald' | 'blue' | 'violet';
  createdAt: string;
}

interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isBookmarked: boolean;
}

const COLOR_MAP = {
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/15',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/15',
};

export const NotesNotebook = () => {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useLocalStorage<Notebook[]>('apex_notebooks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('apex_notebook_notes', []);
  const [isLoading, setIsLoading] = useState(false);

  // Selected state
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Creation state
  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('amber');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const activeNotes = useMemo(() => {
    return notes.filter(n => n.notebookId === selectedNotebookId);
  }, [notes, selectedNotebookId]);

  const selectedNotebook = useMemo(() => {
    return notebooks.find(nb => nb.id === selectedNotebookId);
  }, [notebooks, selectedNotebookId]);

  const createNotebook = () => {
    if (!newNotebookTitle.trim()) return;
    const newNB: Notebook = {
      id: crypto.randomUUID(),
      title: newNotebookTitle.trim(),
      color: newNotebookColor,
      createdAt: new Date().toISOString()
    };
    setNotebooks(prev => [newNB, ...prev]);
    setNewNotebookTitle('');
    setIsCreateNotebookOpen(false);
  };

  const deleteNotebook = (id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    setNotes(prev => prev.filter(n => n.notebookId !== id));
    if (selectedNotebookId === id) {
      setSelectedNotebookId(null);
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const createNote = () => {
    if (!selectedNotebookId) return;
    const newN: Note = {
      id: crypto.randomUUID(),
      notebookId: selectedNotebookId,
      title: 'Yeni Not',
      content: '',
      category: 'Genel',
      createdAt: new Date().toISOString(),
      isBookmarked: false
    };
    setNotes(prev => [newN, ...prev]);
    setSelectedNote(newN);
    setEditTitle(newN.title);
    setEditContent(newN.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: editTitle, content: editContent } : n));
    setSelectedNote(prev => prev ? { ...prev, title: editTitle, content: editContent } : null);
    setIsEditing(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const toggleBookmark = (note: Note) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isBookmarked: !n.isBookmarked } : n));
    if (selectedNote?.id === note.id) {
      setSelectedNote(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 min-h-[500px]">
      {/* Side Bar: Notebooks */}
      <div className="w-full lg:w-64 flex flex-col gap-3 bento-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-sm uppercase tracking-wider text-text-secondary">Defterler</span>
          <button
            onClick={() => setIsCreateNotebookOpen(true)}
            className="p-1 rounded-lg bg-skel-matte/5 hover:bg-skel-matte/10 text-text-primary transition-colors cursor-pointer"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {isCreateNotebookOpen && (
          <div className="p-3 border border-border/10 rounded-xl bg-skel-matte/5 space-y-2">
            <input
              type="text"
              placeholder="Defter Adı"
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-skel-matte/5 text-xs text-text-primary outline-none border border-border/10"
            />
            <div className="flex gap-2 justify-center">
              {(['amber', 'rose', 'emerald', 'blue', 'violet'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setNewNotebookColor(c)}
                  className={`w-4 h-4 rounded-full border ${newNotebookColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ backgroundColor: c === 'amber' ? '#f59e0b' : c === 'rose' ? '#f43f5e' : c === 'emerald' ? '#10b981' : c === 'blue' ? '#3b82f6' : '#8b5cf6' }}
                />
              ))}
            </div>
            <div className="flex gap-2 text-[10px] font-bold">
              <button onClick={createNotebook} className="flex-1 py-1 bg-focus-main text-white rounded-lg">Ekle</button>
              <button onClick={() => setIsCreateNotebookOpen(false)} className="flex-1 py-1 bg-skel-matte/20 rounded-lg text-text-secondary">Vazgeç</button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 overflow-y-auto">
          {notebooks.map(nb => (
            <div
              key={nb.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${selectedNotebookId === nb.id ? 'bg-focus-main/10 border-focus-main/30 text-focus-neon' : 'bg-transparent border-transparent text-text-secondary hover:text-text-primary'}`}
              onClick={() => { setSelectedNotebookId(nb.id); setSelectedNote(null); setIsEditing(false); }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${nb.color === 'amber' ? 'bg-amber-500' : nb.color === 'rose' ? 'bg-rose-500' : nb.color === 'emerald' ? 'bg-emerald-500' : nb.color === 'blue' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                <span>{nb.title}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotebook(nb.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-crit-vivid transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Notes List & Editor */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {selectedNotebookId ? (
          <>
            {/* Notes List */}
            <div className="w-full lg:w-60 flex flex-col gap-3 bento-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm uppercase tracking-wider text-text-secondary">Notlar</span>
                <button
                  onClick={createNote}
                  className="p-1 rounded-lg bg-skel-matte/5 hover:bg-skel-matte/10 text-text-primary transition-colors cursor-pointer"
                >
                  <FilePlus size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto">
                {activeNotes.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${selectedNote?.id === n.id ? 'bg-focus-main/10 border-focus-main/30' : 'bg-skel-matte/5 border-border/10 hover:border-border/25'}`}
                    onClick={() => { setSelectedNote(n); setEditTitle(n.title); setEditContent(n.content); setIsEditing(false); }}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-text-primary truncate">{n.title || 'Başlıksız Not'}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleBookmark(n); }} className="text-text-secondary hover:text-focus-neon">
                        <CheckSquare size={12} className={n.isBookmarked ? 'fill-focus-neon' : ''} />
                      </button>
                    </div>
                    <p className="text-text-secondary truncate opacity-60">{n.content || 'Boş Not'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Editor */}
            <div className="flex-1 bento-card p-6 flex flex-col gap-4">
              {selectedNote ? (
                <>
                  {isEditing ? (
                    <div className="flex-1 flex flex-col gap-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent text-xl font-display font-black text-text-primary outline-none border-b border-border/10 pb-2"
                        placeholder="Not Başlığı"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full bg-transparent text-sm text-text-primary outline-none resize-none font-mono"
                        placeholder="İçeriğinizi buraya yazın..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={saveNote} className="px-4 py-2 rounded-xl bg-focus-main text-white text-xs font-bold flex items-center gap-1"><Save size={14} /> Kaydet</button>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl bg-skel-matte/20 text-text-secondary text-xs font-bold">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-border/10 pb-3">
                        <h2 className="text-2xl font-display font-black text-text-primary">{selectedNote.title || 'Başlıksız Not'}</h2>
                        <div className="flex gap-2">
                          <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg bg-skel-matte/5 hover:bg-skel-matte/10 text-text-primary transition-colors"><Edit3 size={16} /></button>
                          <button onClick={() => deleteNote(selectedNote.id)} className="p-2 rounded-lg bg-skel-matte/5 hover:bg-crit-pale hover:text-crit-vivid text-text-secondary transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="flex-1 text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed opacity-85">
                        {selectedNote.content || <span className="italic opacity-40">Not içeriği bulunmuyor. Düzenlemek için kalem simgesine tıklayın.</span>}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary opacity-40">
                  <BookOpen size={48} className="mb-2" />
                  <span className="font-bold">Okumak veya düzenlemek için bir not seçin</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 bento-card p-8 flex flex-col items-center justify-center text-center text-text-secondary opacity-40">
            <BookText size={64} className="mb-3" />
            <span className="font-bold text-lg">Başlamak için sol taraftan bir Defter seçin veya yeni bir Defter oluşturun</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default NotesNotebook;
