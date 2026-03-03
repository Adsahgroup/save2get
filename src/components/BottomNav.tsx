import React from 'react';
import { Home, PiggyBank, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'savings', label: 'K-SAVE', icon: PiggyBank },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex justify-between items-center safe-area-bottom z-50 md:rounded-none md:absolute">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1.5 group relative"
          >
            <div className={`transition-all duration-300 ${isActive ? 'text-brand-pink scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-brand-pink' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
