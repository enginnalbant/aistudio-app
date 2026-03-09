import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, ArrowDownRight, ArrowUpRight, Calendar, FileText, Check } from 'lucide-react';

interface PaymentWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  accountId: string;
  accountName: string;
}

export function PaymentWizardModal({ isOpen, onClose, onSave, accountId, accountName }: PaymentWizardModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'OUTGOING', // OUTGOING = Tediye (We pay), INCOMING = Tahsilat (We receive)
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!formData.amount || isNaN(Number(formData.amount))) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/accounts/${accountId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });
      
      if (response.ok) {
        onSave();
        onClose();
        // Reset form
        setStep(1);
        setFormData({
          type: 'OUTGOING',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
      }
    } catch (error) {
      console.error('Error saving payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-skel-dark/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl layer-3d overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-skel-matte/20 flex justify-between items-center shrink-0 bg-skel-matte/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-focus-neon/10 flex items-center justify-center text-focus-neon">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-skel-glass">Ödeme / Tahsilat Girişi</h2>
              <p className="text-xs text-skel-metal uppercase tracking-widest font-bold mt-0.5">
                {accountName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-skel-metal hover:text-skel-glass hover:bg-skel-matte/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <button 
              onClick={() => setFormData({...formData, type: 'OUTGOING'})}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 ${
                formData.type === 'OUTGOING' 
                  ? 'bg-grow-main/10 border-grow-main/30' 
                  : 'bg-skel-matte/20 border-skel-matte/20 hover:border-skel-matte/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                formData.type === 'OUTGOING' ? 'bg-grow-main text-skel-glass shadow-lg shadow-grow-main/20' : 'bg-skel-matte/30 text-skel-metal'
              }`}>
                <ArrowDownRight size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${formData.type === 'OUTGOING' ? 'text-grow-main' : 'text-skel-glass'}`}>Ödeme Yaptım</h3>
                <p className="text-xs text-skel-metal mt-1">Cariye yapılan ödeme</p>
              </div>
            </button>

            <button 
              onClick={() => setFormData({...formData, type: 'INCOMING'})}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 ${
                formData.type === 'INCOMING' 
                  ? 'bg-crit-vivid/10 border-crit-vivid/30' 
                  : 'bg-skel-matte/20 border-skel-matte/20 hover:border-skel-matte/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                formData.type === 'INCOMING' ? 'bg-crit-vivid text-skel-glass shadow-lg shadow-crit-vivid/20' : 'bg-skel-matte/30 text-skel-metal'
              }`}>
                <ArrowUpRight size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${formData.type === 'INCOMING' ? 'text-crit-vivid' : 'text-skel-glass'}`}>Ödeme Aldım</h3>
                <p className="text-xs text-skel-metal mt-1">Cariden alınan ödeme</p>
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Tutar (₺) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-skel-matte" size={18} />
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all font-mono text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Tarih *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-skel-matte" size={18} />
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Açıklama (Opsiyonel)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-skel-matte" size={18} />
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                  placeholder="EFT, Nakit, Çek vb. detaylar..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-skel-matte/20 flex justify-end gap-3 bg-skel-matte/10">
          <button 
            onClick={onClose}
            className="os-btn os-btn-secondary"
            disabled={isSubmitting}
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.amount || isSubmitting}
            className={`os-btn ${formData.type === 'OUTGOING' ? 'bg-grow-main hover:bg-grow-main/90 shadow-grow-main/20' : 'bg-crit-vivid hover:bg-crit-vivid/90 shadow-crit-vivid/20'} text-skel-glass border-transparent shadow-lg`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-skel-matte/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Kaydet
          </button>
        </div>
      </motion.div>
    </div>
  );
}
