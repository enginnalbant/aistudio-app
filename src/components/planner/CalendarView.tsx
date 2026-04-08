import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';

interface CalendarViewProps {
  date: string;
  setDate: (d: string) => void;
}

export const CalendarView = ({ date, setDate }: CalendarViewProps) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start (0=Sunday -> 6, 1=Monday -> 0)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const [view, setView] = useState<'Aylık' | 'Haftalık' | 'Günlük'>('Aylık');
  const [monthEvents, setMonthEvents] = useState<any[]>([]);
  const [activePopupDate, setActivePopupDate] = useState<string | null>(null);
  const [popupItems, setPopupItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMonthEvents = async () => {
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      try {
        const res = await fetch(`/api/planner/summaries?start_date=${start}&end_date=${end}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setMonthEvents(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      } catch (error) {
        console.error('Error fetching month events:', error);
        setMonthEvents(prev => prev.length === 0 ? prev : []);
      }
    };
    fetchMonthEvents();
  }, [year, month]);

  useEffect(() => {
    if (activePopupDate) {
      const fetchPopupItems = async () => {
        try {
          const res = await fetch(`/api/planner/${activePopupDate}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          const items = Array.isArray(data) ? data : [];
          setPopupItems(prev => JSON.stringify(prev) === JSON.stringify(items) ? prev : items);
        } catch (error) {
          console.error('Error fetching popup items:', error);
          setPopupItems(prev => prev.length === 0 ? prev : []);
        }
      };
      fetchPopupItems();
    }
  }, [activePopupDate]);

  const exportPopupPDF = () => {
    if (!activePopupDate) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text(`Günlük Plan - ${activePopupDate}`, 14, 20);
    
    autoTable(doc, {
      head: [['Saat', 'Plan', 'Açıklama', 'Durum']],
      body: popupItems.map(item => [
        item.time_range || '-',
        item.item_key,
        item.description || '-',
        item.morning_status === 1 ? 'Tamamlandı' : item.morning_status === 2 ? 'Kısmen' : 'Bekliyor'
      ]),
      startY: 30,
    });
    doc.save(`plan_${activePopupDate}.pdf`);
  };

  const popupRef = React.useRef<HTMLDivElement>(null);

  const exportPopupPNG = async () => {
    if (!popupRef.current) return;
    try {
      const dataUrl = await toPng(popupRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `plan_${activePopupDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  return (
    <div className="layer-3d p-6 mt-12 bg-white/90 backdrop-blur-md border border-border rounded-3xl relative shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-text-primary capitalize">{d.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}</h3>
        <div className="flex bg-bg-app p-1 rounded-xl">
          {['Aylık', 'Haftalık', 'Günlük'].map(v => (
            <button key={v} onClick={() => setView(v as any)} className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${view === v ? 'bg-white shadow-sm text-emerald-500' : 'text-text-secondary'}`}>{v}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDate(new Date(year, month - 1, 1).toISOString().split('T')[0])} className="p-2 hover:bg-bg-app rounded-xl"><ChevronLeft size={20} /></button>
          <button onClick={() => setDate(new Date(year, month + 1, 1).toISOString().split('T')[0])} className="p-2 hover:bg-bg-app rounded-xl"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      {view === 'Aylık' && (
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-secondary uppercase">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <div key={day} className="py-2">{day}</div>)}
          {blanks.map(b => <div key={`blank-${b}`}></div>)}
          {days.map(day => {
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const events = monthEvents.filter(e => e.date === dayStr);
            const isToday = dayStr === new Date().toISOString().split('T')[0];
            const isSelected = date === dayStr;
            
            // Heatmap intensity
            const intensity = Math.min(events.length * 20, 100);
            const bgClass = events.length > 0 ? `bg-emerald-${intensity > 0 ? Math.max(100, Math.min(900, intensity * 10)) : 100}` : 'bg-bg-app/30';

            return (
              <button 
                key={day} 
                onClick={() => setActivePopupDate(dayStr)}
                className={`
                  relative p-4 rounded-2xl font-black transition-all group
                  ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : `${bgClass} hover:bg-emerald-100`}
                  ${isToday && !isSelected ? 'border-2 border-emerald-500 text-emerald-500' : ''}
                `}
              >
                <span className="relative z-10">{day}</span>
                {events.length > 0 && (
                  <span className="absolute top-1 right-1 text-[8px] bg-white/20 px-1 rounded">{events.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {view !== 'Aylık' && (
        <div className="text-center py-20 text-text-secondary">Bu görünüm yakında eklenecek.</div>
      )}

      {/* Popup */}
      {activePopupDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div ref={popupRef} className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-black text-text-primary">{activePopupDate} Planı</h2>
                <button onClick={() => setActivePopupDate(null)} className="p-2 hover:bg-bg-app rounded-xl"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar mb-6">
                {popupItems.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="p-3 text-text-secondary font-bold text-sm">Saat</th>
                        <th className="p-3 text-text-secondary font-bold text-sm">Görev</th>
                        <th className="p-3 text-text-secondary font-bold text-sm">Açıklama</th>
                        <th className="p-3 text-text-secondary font-bold text-sm">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popupItems.map((item) => (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="p-3 font-mono text-emerald-500 font-bold">{item.time_range || '-'}</td>
                          <td className="p-3 font-bold text-text-primary">{item.item_key}</td>
                          <td className="p-3 text-text-secondary text-sm">{item.description}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              item.morning_status === 1 ? 'bg-emerald-500/10 text-emerald-500' : 
                              item.morning_status === 2 ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-skel-metal/10 text-text-secondary'
                            }`}>
                              {item.morning_status === 1 ? 'Tamamlandı' : item.morning_status === 2 ? 'Kısmen' : 'Bekliyor'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-text-secondary">
                    <p>Bu tarih için plan bulunamadı.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end flex-shrink-0">
                <button onClick={() => { setDate(activePopupDate); setActivePopupDate(null); }} className="px-4 py-2 hover:bg-bg-app rounded-xl font-bold text-text-secondary mr-auto">
                  Bu Güne Git
                </button>
                <button onClick={exportPopupPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all">
                  <Download size={16} /> PDF
                </button>
                <button onClick={exportPopupPNG} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all">
                  <Download size={16} /> PNG
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
