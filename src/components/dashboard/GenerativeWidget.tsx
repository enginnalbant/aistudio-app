import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import * as Icons from 'lucide-react';

export interface GenerativeWidgetProps {
  type: 'chart' | 'list' | 'stat' | 'custom';
  title: string;
  data: any[];
  config: {
    chartType?: 'bar' | 'line' | 'pie';
    icon?: string;
    color?: string;
    columns?: string[];
  };
}

const COLORS = ['#0066FF', '#82B1FF', '#7B2CBF', '#B983FF', '#00C853', '#69F0AE', '#FFD600', '#FF4D4F'];

export function GenerativeWidget({ type, title, data, config }: GenerativeWidgetProps) {
  const IconComponent = config.icon ? (Icons as any)[config.icon] : Icons.Sparkles;

  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200} debounce={100} minWidth={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(161, 165, 183, 0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-skel-space)', 
                  borderColor: 'rgba(161, 165, 183, 0.1)', 
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="value" fill={config.color || '#0066FF'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200} debounce={100} minWidth={0}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(161, 165, 183, 0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-skel-space)', 
                  borderColor: 'rgba(161, 165, 183, 0.1)', 
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
              <Line type="monotone" dataKey="value" stroke={config.color || '#0066FF'} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200} debounce={100} minWidth={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-skel-space)', 
                  borderColor: 'rgba(161, 165, 183, 0.1)', 
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderList = () => (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-focus-neon" />
            <span className="text-xs font-bold text-text-primary">{item.name || item.title}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-text-secondary">{item.value || item.status}</span>
        </div>
      ))}
    </div>
  );

  const renderStat = () => (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="text-5xl font-display font-black tracking-tighter text-text-primary mb-2">
        {data[0]?.value}
      </div>
      <div className="label-mono text-focus-neon">{data[0]?.label || 'Toplam'}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-focus-main/10 text-focus-neon flex items-center justify-center border border-focus-neon/20">
          <IconComponent size={20} />
        </div>
        <h3 className="text-lg font-display font-black tracking-tighter text-text-primary">{title}</h3>
      </div>
      
      <div className="flex-1 min-h-0 min-w-0">
        {type === 'chart' && renderChart()}
        {type === 'list' && renderList()}
        {type === 'stat' && renderStat()}
      </div>
    </div>
  );
}
