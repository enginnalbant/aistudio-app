import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DailySummary {
  date: string;
  summary: string;
}

interface DaysBarProps {
  date: string;
  setDate: (d: string) => void;
  onDateClick: (d: string) => void;
}

export const DaysBar = ({ date, setDate, onDateClick }: DaysBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Generate 5 days centered on the current date
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 2 + i);
    return d;
  });

  // Center the selected date whenever it changes
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      
      const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.clientWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [date]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const start = days[0].toISOString().split('T')[0];
      const end = days[days.length - 1].toISOString().split('T')[0];
      try {
        const res = await fetch(`/api/planner/summaries?start_date=${start}&end_date=${end}`);
        if (res.ok) {
          const data = await res.json();
          setSummaries(data);
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
      }
    };
    fetchSummaries();
  }, [date]);

  const handleDownloadPDF = async (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/planner/${dateStr}`);
      if (!res.ok) throw new Error('Failed to fetch plan');
      const items = await res.json();
      
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.text(`Daily Plan - ${dateStr}`, 14, 20);
      
      const tableData = items.map((item: any) => [
        item.time_range || '-',
        item.item_key,
        item.description || '-',
        item.morning_status === 1 ? 'Completed' : item.morning_status === 2 ? 'Partial' : 'Pending',
        item.evening_status === 1 ? 'Completed' : item.evening_status === 2 ? 'Partial' : 'Pending'
      ]);

      autoTable(doc, {
        head: [['Time', 'Task', 'Description', 'Morning', 'Evening']],
        body: tableData,
        startY: 30,
      });

      doc.save(`plan-${dateStr}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    let startX = e.pageX - el.offsetLeft;
    let scrollLeft = el.scrollLeft;
    
    const onMouseMove = (e: MouseEvent) => {
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX);
    };
    
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-bg-card/80 backdrop-blur-xl border border-border/50 rounded-full my-4 relative shadow-[0_0_30px_rgba(16,185,129,0.1)] mx-auto max-w-full layer-3d perspective-1000">
      <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-bg-app rounded-full transition-all shadow-sm border border-transparent hover:border-border/50 text-text-secondary hover:text-text-primary flex-shrink-0"><ChevronLeft size={20} /></button>
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto custom-scrollbar px-4 py-4 scroll-smooth items-center justify-start flex-1"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {days.map((d, i) => {
          const dateStr = d.toISOString().split('T')[0];
          const isSelected = dateStr === date;
          const isPast = d < new Date(new Date().setHours(0,0,0,0));
          const summary = summaries.find(s => s.date === dateStr)?.summary;
          
          // Calculate distance from selected for 3D effect
          const selectedIndex = days.findIndex(day => day.toISOString().split('T')[0] === date);
          const distance = Math.abs(i - selectedIndex);
          const scale = isSelected ? 1.2 : Math.max(0.8, 1 - distance * 0.05);
          const opacity = isSelected ? 1 : Math.max(0.4, 1 - distance * 0.1);
          const zIndex = isSelected ? 50 : 40 - distance;

          return (
            <div 
              key={i}
              className="relative group"
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              style={{
                transform: `scale(${scale}) translateZ(${isSelected ? '20px' : '0px'})`,
                opacity: opacity,
                zIndex: zIndex,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <button 
                ref={isSelected ? selectedRef : null}
                onClick={() => onDateClick(dateStr)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] transition-all duration-300 relative overflow-hidden ${
                  isSelected 
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_10px_25px_rgba(16,185,129,0.5)] border border-emerald-300/50' 
                    : `bg-bg-app/50 text-text-secondary hover:bg-bg-app hover:text-text-primary border border-border/50 hover:border-emerald-500/30 ${isPast ? 'grayscale opacity-70' : ''}`
                }`}
              >
                {/* Ripple Effect Container */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white/20 animate-ping opacity-0 rounded-2xl" style={{ animationDuration: '2s' }}></div>
                )}
                
                <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-90">{d.toLocaleString('tr-TR', { weekday: 'short' })}</span>
                <span className="text-2xl font-black tracking-tighter">{d.getDate()}</span>
                
                {/* Heatmap Bar (Mocked for now, can be connected to real data) */}
                <div className="w-full h-1 bg-black/10 rounded-full mt-2 overflow-hidden flex">
                  <div className={`h-full ${isSelected ? 'bg-white' : 'bg-emerald-500'} w-[60%] rounded-full`}></div>
                </div>
              </button>

              {/* Hover Actions */}
              <div className={`absolute -top-3 -right-3 flex gap-1 transition-all duration-300 ${hoveredDate === dateStr ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2'}`}>
                <button 
                  onClick={(e) => handleDownloadPDF(e, dateStr)}
                  className="p-2 bg-bg-card text-emerald-500 border border-border rounded-full shadow-xl hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all"
                  title="Download PDF"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-bg-app rounded-full transition-all shadow-sm border border-transparent hover:border-border/50 text-text-secondary hover:text-text-primary flex-shrink-0"><ChevronRight size={20} /></button>
    </div>
  );
};
