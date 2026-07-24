import React from 'react';
import { StockList } from './StockList';

const PageContainer = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="p-8 bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl h-full min-h-[400px]">
    <h1 className="text-2xl font-display font-black text-text-primary uppercase tracking-tight">{title}</h1>
    <p className="text-text-secondary opacity-60 mt-4 font-mono text-sm uppercase tracking-widest">{subtitle}</p>
    <div className="mt-12 border-2 border-dashed border-skel-metal/10 rounded-3xl h-64 flex items-center justify-center">
      <span className="text-text-secondary opacity-20 font-display font-bold uppercase italic">İçerik Hazırlanıyor...</span>
    </div>
  </div>
);

// STOKLAR
import { StockDashboard } from './StockDashboard';
import { StockList as StockListComp } from './StockList';
import { StockReports } from './StockReports';
import { StockAnalytics } from './StockAnalytics';

export const StocksDashboard = () => <StockDashboard />;
export const StocksList = () => <StockListComp />;
export const StocksReports = () => <StockReports />;
export const StocksAnalytics = () => <StockAnalytics />;

// CARİLER
import { ContactDashboard } from './ContactDashboard';
import { ContactList } from './ContactList';
import { ContactReports } from './ContactReports';
import { ContactAnalytics } from './ContactAnalytics';

export const ContactsDashboard = () => <ContactDashboard />;
export const ContactsList = () => <ContactList />;
export const ContactsReports = () => <ContactReports />;
export const ContactsAnalytics = () => <ContactAnalytics />;

