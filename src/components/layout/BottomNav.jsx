import React from 'react';
import { Clock, History, BarChart3, PlusCircle } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, activeCount, completedCount }) {
  const tabs = [
    {
      id: 'active',
      label: 'Active',
      icon: Clock,
      badge: activeCount > 0 ? activeCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'timelines',
      label: 'Timelines',
      icon: History,
      badge: completedCount > 0 ? completedCount : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-20 py-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== null && (
                  <span className={`absolute -top-1.5 -right-3 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-semibold tracking-tight ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Active Tab Underline Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
