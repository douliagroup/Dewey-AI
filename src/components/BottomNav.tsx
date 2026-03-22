import React from 'react';
import { LayoutDashboard, TrendingUp, MessageSquare, Settings, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { translations, Language } from '../translations';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  role?: string;
}

export function BottomNav({ activeTab, setActiveTab, lang, role }: BottomNavProps) {
  const t = translations[lang];

  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'progress', label: t.progress, icon: TrendingUp },
    { id: 'ai', label: t.ai_mentor, icon: MessageSquare },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  if (role === 'admin') {
    tabs.splice(3, 0, { id: 'admin', label: t.admin_panel, icon: ShieldAlert });
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 pb-safe shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors relative",
                isActive ? "text-dewey-dark" : "text-dewey-dark/60"
              )}
            >
              <Icon size={20} className={cn(isActive && "animate-in zoom-in-90 duration-300")} />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-dewey-dark rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
