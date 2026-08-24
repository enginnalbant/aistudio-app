import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { BookItem } from '../KnowledgeWorkspace';

interface LibraryTabProps {
  books: BookItem[];
  setBooks: (bks: BookItem[] | ((prev: BookItem[]) => BookItem[])) => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  books,
  setBooks
}) => {
  const handleAddBook = () => {
    const title = prompt('Kitap Başlığı:');
    const author = prompt('Yazar Adı:');
    if (!title) return;

    const newBook: BookItem = {
      id: `b-${Date.now()}`,
      title,
      author: author || 'Bilinmiyor',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      progress: 0,
      status: 'Reading',
      highlights: []
    };
    setBooks(prev => [newBook, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-3xl border border-white/10 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="text-pink-400" /> Digital Bookshelf & Reading List
        </h2>
        <button 
          onClick={handleAddBook}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Book / PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map(bk => (
          <div key={bk.id} className="bg-slate-900/60 border border-white/10 p-5 rounded-3xl flex gap-4 shadow-xl">
            <img src={bk.cover} alt={bk.title} className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10 shrink-0" />
            <div className="flex-1 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">{bk.status}</span>
                <h3 className="text-base font-bold text-white mt-1">{bk.title}</h3>
                <p className="text-xs text-slate-400">{bk.author}</p>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Reading Progress</span>
                  <span className="font-bold text-white">{bk.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500" style={{ width: `${bk.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
