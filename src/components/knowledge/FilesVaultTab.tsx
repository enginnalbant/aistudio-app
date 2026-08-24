import React from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { FileItem } from '../KnowledgeWorkspace';

interface FilesVaultTabProps {
  files: FileItem[];
  setFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
}

export const FilesVaultTab: React.FC<FilesVaultTabProps> = ({
  files,
  setFiles
}) => {
  const handleAddFile = () => {
    const name = prompt('Dosya Adı:');
    if (!name) return;
    const newFile: FileItem = {
      id: `f-${Date.now()}`,
      name,
      size: '1.5 MB',
      type: name.split('.').pop()?.toUpperCase() || 'FILE',
      updated: 'Just now',
      folder: 'Documents',
      iconName: 'FileText'
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder className="text-indigo-400" /> Cloud Files Vault
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">{files.length} Files</span>
            <button
              onClick={handleAddFile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus size={14} /> Upload File
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {files.map(f => (
            <div key={f.id} className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl space-y-2 group relative">
              <div className="flex justify-between items-center">
                <Folder size={20} className="text-indigo-400" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">{f.size}</span>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <h3 className="text-xs font-bold text-white truncate">{f.name}</h3>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{f.type}</span>
                <span>{f.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
