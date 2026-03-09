import React, { useState, useEffect } from 'react';
import { Paperclip, Trash2, File, Download, X, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface FileUploaderProps {
  relatedId: string;
  relatedType: 'task' | 'note' | 'planner' | 'reminder';
}

export const FileUploader: React.FC<FileUploaderProps> = ({ relatedId, relatedType }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) fetchAttachments();
  }, [showModal, relatedId]);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attachments/${relatedId}`);
      const data = await res.json();
      setAttachments(data);
    } catch (err) {
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            related_id: relatedId,
            related_type: relatedType,
            file_name: file.name,
            file_type: file.type,
            file_data: base64Data
          })
        });
        fetchAttachments();
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteAttachment = async (id: string) => {
    try {
      await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
      fetchAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  const downloadAttachment = async (id: string, fileName: string) => {
    try {
      const res = await fetch(`/api/attachments/download/${id}`);
      const data = await res.json();
      const link = document.createElement('a');
      link.href = data.file_data;
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="p-2 text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all relative"
      >
        <Paperclip size={18} />
        {attachments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg">
            {attachments.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
                  <Paperclip className="text-emerald-500" />
                  Dosya Ekleri
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg-app rounded-xl text-text-secondary">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                  </div>
                ) : attachments.length > 0 ? (
                  attachments.map((file) => (
                    <div key={file.id} className="p-4 bg-bg-app/50 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                          <File size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{file.file_name}</p>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => downloadAttachment(file.id, file.file_name)}
                          className="p-2 text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => deleteAttachment(file.id)}
                          className="p-2 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-text-secondary opacity-50">
                    <Paperclip size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Henüz dosya eklenmemiş.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <label className="flex items-center justify-center gap-3 p-4 bg-emerald-500 text-white rounded-2xl cursor-pointer hover:bg-emerald-600 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">
                  <Plus size={18} />
                  Dosya Yükle
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
