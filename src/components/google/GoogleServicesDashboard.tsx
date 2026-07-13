import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Calendar, Mail, CheckSquare, List, HardDrive, BookOpen, Table } from 'lucide-react';

export const GoogleServicesDashboard = () => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const services = ['drive', 'docs', 'sheets', 'gmail', 'calendar', 'tasks'];
        const results = await Promise.all(services.map(s => 
          fetch(`/api/google/${s}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }).then(res => res.json())
        ));
        
        setData(results.reduce((acc, res, i) => ({ ...acc, [services[i]]: res }), {}));
      } catch (error) {
        console.error('Error fetching google data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  if (!accessToken) return <div className="p-6 text-text-secondary">Lütfen Google hesabınızla giriş yapın.</div>;

  const ServiceCard = ({ icon: Icon, title, dataKey, renderItem }: any) => (
    <div className="bento-card p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Icon className="text-focus-neon" /> {title}</h3>
      {loading ? <p className="text-sm text-text-secondary">Yükleniyor...</p> : 
        <ul className="space-y-2 text-sm text-text-secondary">
          {(data[dataKey]?.files || data[dataKey]?.items || data[dataKey]?.messages || data[dataKey]?.items)?.slice(0, 5).map((item: any, i: number) => (
            <li key={i} className="truncate">{renderItem(item)}</li>
          ))}
        </ul>
      }
    </div>
  );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServiceCard icon={HardDrive} title="Drive" dataKey="drive" renderItem={(i: any) => i.name} />
      <ServiceCard icon={BookOpen} title="Docs" dataKey="docs" renderItem={(i: any) => i.name} />
      <ServiceCard icon={Table} title="Sheets" dataKey="sheets" renderItem={(i: any) => i.name} />
      <ServiceCard icon={Mail} title="Gmail" dataKey="gmail" renderItem={(i: any) => 'Mesaj ID: ' + i.id} />
      <ServiceCard icon={Calendar} title="Takvim" dataKey="calendar" renderItem={(i: any) => i.summary} />
      <ServiceCard icon={CheckSquare} title="Görevler" dataKey="tasks" renderItem={(i: any) => i.title} />
    </div>
  );
};
