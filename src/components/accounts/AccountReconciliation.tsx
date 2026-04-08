import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Printer,
  ChevronRight,
  Calendar,
  Filter,
  CreditCard,
  AlertCircle,
  Clock
} from 'lucide-react';
import { PaymentWizardModal } from './PaymentWizardModal';

export function AccountReconciliation() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [filterOverdue, setFilterOverdue] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounts/summary?t=${Date.now()}`);
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
      
      // If an account was selected, update its data too
      if (selectedAccount && Array.isArray(data)) {
        const updated = data.find((a: any) => a.id === selectedAccount.id);
        if (updated) setSelectedAccount(updated);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    setIsTransactionsLoading(true);
    try {
      const response = await fetch(`/api/accounts/${accountId}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const handleSelectAccount = (account: any) => {
    setSelectedAccount(account);
    fetchTransactions(account.id);
  };

  const filteredAccounts = (Array.isArray(accounts) ? accounts : []).filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.series && a.series.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterOverdue) {
      return matchesSearch && (a.overdue_debt > 0);
    }
    return matchesSearch;
  });

  const totalOverdue = (Array.isArray(accounts) ? accounts : []).reduce((sum, a) => sum + (a.overdue_debt || 0), 0);
  const overdueCount = (Array.isArray(accounts) ? accounts : []).filter(a => a.overdue_debt > 0).length;

  return (
    <div className="h-full flex flex-col pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Cari Mutabakat</h1>
          <p className="text-text-secondary text-sm">Cari hesap hareketleri ve mutabakat dökümleri.</p>
        </div>

        {totalOverdue > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Vadesi Geçen Toplam</p>
              <p className="text-xl font-mono font-bold text-text-primary">₺{totalOverdue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-red-500/20 mx-2" />
            <div className="text-right">
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Kritik Cari</p>
              <p className="text-lg font-mono font-bold text-red-500">{overdueCount}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Pane: Accounts List */}
        <div className="w-full lg:w-1/3 flex flex-col bento-card overflow-hidden shrink-0">
          <div className="p-4 border-b border-border shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Cari ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-all"
              />
            </div>
            
            <button 
              onClick={() => setFilterOverdue(!filterOverdue)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${
                filterOverdue 
                  ? 'bg-red-500/20 border-red-500/40 text-red-500' 
                  : 'bg-bg-app border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} />
                Vadesi Geçenleri Göster
              </div>
              {overdueCount > 0 && <span className="bg-red-500 text-bg-card px-1.5 py-0.5 rounded-md text-[10px]">{overdueCount}</span>}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              </div>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                    selectedAccount?.id === account.id 
                      ? 'bg-accent text-bg-card' 
                      : 'hover:bg-bg-app border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedAccount?.id === account.id ? 'bg-bg-card/20 text-bg-card' : 'bg-bg-app text-text-secondary'
                    }`}>
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-bold truncate ${selectedAccount?.id === account.id ? 'text-bg-card' : 'text-text-primary'}`}>
                        {account.name}
                      </h4>
                      <p className={`text-[10px] font-mono uppercase truncate ${selectedAccount?.id === account.id ? 'text-bg-card/60' : 'text-text-secondary'}`}>
                        {account.series || 'KODSUZ'} • {account.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`font-mono font-bold text-sm ${selectedAccount?.id === account.id ? 'text-bg-card' : (account.balance > 0 ? 'text-red-500' : account.balance < 0 ? 'text-emerald-500' : 'text-text-primary')}`}>
                      ₺{Math.abs(account.balance).toLocaleString()}
                    </p>
                    <div className="flex flex-col items-end">
                      <p className={`text-[9px] uppercase font-bold tracking-widest ${selectedAccount?.id === account.id ? 'text-bg-card/60' : 'text-text-secondary'}`}>
                        {account.balance > 0 ? 'Borçluyuz' : account.balance < 0 ? 'Alacaklıyız' : 'Kapalı'}
                      </p>
                      {account.overdue_debt > 0 && (
                        <span className={`text-[9px] font-bold px-1 rounded mt-0.5 animate-pulse ${selectedAccount?.id === account.id ? 'bg-bg-card/20 text-bg-card' : 'bg-red-500/10 text-red-500'}`}>
                          VADESİ GEÇTİ
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-text-secondary text-sm">
                Cari bulunamadı
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Transaction Details */}
        <div className="flex-1 bento-card flex flex-col overflow-hidden">
          {selectedAccount ? (
            <>
              {/* Account Header */}
              <div className="p-6 border-b border-border bg-bg-app/50 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-bg-card shadow-lg shadow-accent/10">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-text-primary">{selectedAccount.name}</h2>
                          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono uppercase mt-1">
                            <span className="bg-bg-app px-2 py-0.5 rounded border border-border">{selectedAccount.type}</span>
                            {selectedAccount.series && <span>Kod: {selectedAccount.series}</span>}
                            {selectedAccount.tax_number && <span>VN: {selectedAccount.tax_number}</span>}
                            <span className="flex items-center gap-1 text-accent">
                              <Clock size={12} /> Vade: {selectedAccount.payment_term_days || 0} Gün
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
                        {selectedAccount.phone && (
                          <div className="flex items-center gap-1.5"><Phone size={14} /> {selectedAccount.phone}</div>
                        )}
                        {selectedAccount.email && (
                          <div className="flex items-center gap-1.5"><Mail size={14} /> {selectedAccount.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {selectedAccount.overdue_debt > 0 && (
                        <div className="text-right bg-red-500/10 p-4 rounded-2xl border border-red-500/20 min-w-[160px]">
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Vadesi Geçen</p>
                          <p className="text-2xl font-mono font-bold tracking-tighter text-red-500">
                            ₺{selectedAccount.overdue_debt.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mt-1">
                            ACİL ÖDEME
                          </p>
                        </div>
                      )}
                      <div className="text-right bg-bg-app p-4 rounded-2xl border border-border min-w-[160px]">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Kalan Borç</p>
                        <p className={`text-2xl font-mono font-bold tracking-tighter ${selectedAccount.balance > 0 ? 'text-red-500' : selectedAccount.balance < 0 ? 'text-emerald-500' : 'text-text-primary'}`}>
                          ₺{Math.abs(selectedAccount.balance).toLocaleString()}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedAccount.balance > 0 ? 'text-red-500/70' : selectedAccount.balance < 0 ? 'text-emerald-500/70' : 'text-text-primary/50'}`}>
                          {selectedAccount.balance > 0 ? 'Borçluyuz' : selectedAccount.balance < 0 ? 'Alacaklıyız' : 'Kapalı'}
                        </p>
                      </div>
                    </div>
                  </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="os-btn os-btn-primary text-xs py-2"
                  >
                    <CreditCard size={14} /> Ödeme / Tahsilat Ekle
                  </button>
                  <button className="os-btn os-btn-secondary text-xs py-2">
                    <Printer size={14} /> Yazdır
                  </button>
                  <button className="os-btn os-btn-secondary text-xs py-2">
                    <Download size={14} /> PDF İndir
                  </button>
                  <button className="os-btn os-btn-secondary text-xs py-2">
                    <Mail size={14} /> Mutabakat Gönder
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <FileText size={16} className="text-accent" />
                    Hareket Dökümü
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-bg-app text-text-secondary hover:text-text-primary transition-colors">
                      <Filter size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg bg-bg-app text-text-secondary hover:text-text-primary transition-colors">
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                  {isTransactionsLoading ? (
                    <div className="flex justify-center py-20">
                      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-bg-card/95 backdrop-blur-md z-10">
                        <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold">
                          <th className="p-4">Tarih</th>
                          <th className="p-4">İşlem / Belge No</th>
                          <th className="p-4">Açıklama</th>
                          <th className="p-4 text-right">Miktar x Fiyat</th>
                          <th className="p-4 text-right">Tutar (Borç)</th>
                          <th className="p-4 text-right">Ödeme (Alacak)</th>
                          <th className="p-4 text-right">Kalan Borç</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {transactions.map((t, i) => {
                          const isCost = t.record_type === 'JOB_ITEM';
                          const isPayment = t.record_type === 'PAYMENT';
                          const isOutgoing = t.job_type === 'OUTGOING';
                          
                          return (
                            <tr key={`${t.record_type}-${t.document_no}-${i}`} className="hover:bg-bg-app transition-colors">
                              <td className="p-4 text-text-secondary font-mono text-xs">
                                {new Date(t.date).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {isOutgoing ? (
                                    <ArrowUpRight size={14} className={isCost ? "text-red-500" : "text-emerald-500"} />
                                  ) : (
                                    <ArrowDownRight size={14} className={isCost ? "text-emerald-500" : "text-red-500"} />
                                  )}
                                  <span className="font-mono text-text-primary">{t.document_no}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border mr-2 ${
                                  isPayment 
                                    ? (isOutgoing ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')
                                    : 'bg-bg-app text-text-secondary border-border'
                                }`}>
                                  {isPayment ? (isOutgoing ? 'Tediye' : 'Tahsilat') : 'İşlem'}
                                </span>
                                <span className="text-text-secondary text-xs">{t.description || '-'}</span>
                              </td>
                              <td className="p-4 text-right font-mono text-xs text-text-secondary">
                                {!isPayment ? `${t.qty} x ₺${t.price.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-4 text-right font-mono text-red-500">
                                {isCost ? `₺${t.amount.toLocaleString()}` : (isPayment && !isOutgoing ? `₺${t.amount.toLocaleString()}` : '-')}
                              </td>
                              <td className="p-4 text-right font-mono text-emerald-500">
                                {isPayment && isOutgoing ? `₺${t.amount.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-text-primary">
                                ₺{Math.abs(t.balance).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                      <FileText size={48} className="opacity-20 mb-4" />
                      <p>Bu cariye ait hareket bulunamadı.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-bg-app flex items-center justify-center mb-6">
                <FileText size={40} className="opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Cari Seçin</h3>
              <p className="max-w-md">
                Hareket dökümünü ve mutabakat detaylarını görüntülemek için sol taraftaki listeden bir cari seçin.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {selectedAccount && (
        <AnimatePresence>
          {isPaymentModalOpen && (
            <PaymentWizardModal 
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              onSave={() => {
                fetchAccounts();
                fetchTransactions(selectedAccount.id);
              }}
              accountId={selectedAccount.id}
              accountName={selectedAccount.name}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
