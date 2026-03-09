import React from 'react';
import { motion } from 'motion/react';
import { Target, List, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export interface SummaryWidgetConfig {
  id: string;
  type: 'progress' | 'total' | 'pending' | 'completed' | 'urgent' | 'chart';
  title: string;
  color: string;
}

interface PlannerSummaryWidgetsProps {
  items: any[];
  completedCount: number;
  progress: number;
  widgets: SummaryWidgetConfig[];
}

const WidgetItem = ({ widget, value, icon: Icon, subtext, children }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`layer-3d p-6 flex flex-col border-t-4 ${widget.color.replace('border-l-', 'border-t-')} cursor-grab active:cursor-grabbing group hover:-translate-y-1 transition-transform duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-bg-card to-bg-app rounded-2xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-80">{widget.title}</p>
        {Icon && <div className={`p-2 rounded-xl bg-bg-app ${widget.color.replace('border-l-', 'text-').replace('500', '500')}`}><Icon size={18} /></div>}
      </div>
      {children ? children : (
        <>
          <h3 className="text-4xl font-black text-text-primary tracking-tighter">{value}</h3>
          {subtext && <p className="text-xs text-text-secondary mt-2 font-bold opacity-60">{subtext}</p>}
        </>
      )}
    </div>
  );
};

export const PlannerSummaryWidgets = ({ items, completedCount, progress, widgets }: PlannerSummaryWidgetsProps) => {
  const pendingCount = items.length - completedCount;
  const urgentCount = items.filter(i => i.priority === 2).length;

  const pieData = [
    { name: 'Tamamlanan', value: completedCount, color: '#10b981' },
    { name: 'Bekleyen', value: pendingCount, color: '#f59e0b' },
  ];

  const barData = [
    { name: 'Pzt', val: 80 },
    { name: 'Sal', val: 60 },
    { name: 'Çar', val: 90 },
    { name: 'Per', val: 40 },
    { name: 'Cum', val: 70 },
  ];

  const renderWidget = (widget: SummaryWidgetConfig) => {
    switch (widget.type) {
      case 'progress':
        return (
          <WidgetItem key={widget.id} widget={widget} title={widget.title} icon={Target}>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </WidgetItem>
        );
      case 'chart':
        return (
          <WidgetItem key={widget.id} widget={widget} title={widget.title}>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" hide />
                  <Bar dataKey="val" fill="#00F2FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </WidgetItem>
        );
      case 'total':
        return <WidgetItem key={widget.id} widget={widget} value={items.length} icon={List} subtext="Toplam Görev" />;
      case 'pending':
        return <WidgetItem key={widget.id} widget={widget} value={pendingCount} icon={Clock} subtext="Bekleyen İşler" />;
      case 'completed':
        return <WidgetItem key={widget.id} widget={widget} value={completedCount} icon={CheckCircle2} subtext="Tamamlanan" />;
      case 'urgent':
        return <WidgetItem key={widget.id} widget={widget} value={urgentCount} icon={AlertCircle} subtext="Yüksek Öncelik" />;
      default:
        return null;
    }
  };

  return (
    <>
      {widgets.map(renderWidget)}
    </>
  );
};
